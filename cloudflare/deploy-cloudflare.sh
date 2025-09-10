#!/bin/bash

# Cloudflare Deployment Script for Casino Platform
# This script configures Cloudflare WAF, Rate Limiting, and Caching

set -e

# Configuration variables
ZONE_ID="${CLOUDFLARE_ZONE_ID}"
DOMAIN="${CLOUDFLARE_DOMAIN}"
API_TOKEN="${CLOUDFLARE_API_TOKEN}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check required environment variables
check_requirements() {
    echo -e "${YELLOW}Checking requirements...${NC}"
    
    if [ -z "$ZONE_ID" ]; then
        echo -e "${RED}Error: CLOUDFLARE_ZONE_ID environment variable is not set${NC}"
        exit 1
    fi
    
    if [ -z "$DOMAIN" ]; then
        echo -e "${RED}Error: CLOUDFLARE_DOMAIN environment variable is not set${NC}"
        exit 1
    fi
    
    if [ -z "$API_TOKEN" ]; then
        echo -e "${RED}Error: CLOUDFLARE_API_TOKEN environment variable is not set${NC}"
        exit 1
    fi
    
    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}Error: jq is required but not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ All requirements met${NC}"
}

# Function to make Cloudflare API calls
cf_api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -n "$data" ]; then
        curl -s -X $method "https://api.cloudflare.com/client/v4/$endpoint" \
             -H "Authorization: Bearer $API_TOKEN" \
             -H "Content-Type: application/json" \
             --data "$data"
    else
        curl -s -X $method "https://api.cloudflare.com/client/v4/$endpoint" \
             -H "Authorization: Bearer $API_TOKEN" \
             -H "Content-Type: application/json"
    fi
}

# Configure zone settings
configure_zone_settings() {
    echo -e "${YELLOW}Configuring zone settings...${NC}"
    
    local settings='{
        "value": {
            "security_level": "high",
            "ssl": "full",
            "always_use_https": "on",
            "automatic_https_rewrites": "on",
            "brotli": "on",
            "minify": {
                "css": "on",
                "js": "on", 
                "html": "on"
            },
            "cache_level": "aggressive",
            "browser_check": "on",
            "challenge_ttl": 1800,
            "http3": "on"
        }
    }'
    
    local response=$(cf_api_call "PATCH" "zones/$ZONE_ID/settings" "$settings")
    
    if echo "$response" | jq -e '.success' > /dev/null; then
        echo -e "${GREEN}✓ Zone settings configured successfully${NC}"
    else
        echo -e "${RED}✗ Failed to configure zone settings${NC}"
        echo "$response" | jq '.errors'
    fi
}

# Deploy WAF rules
deploy_waf_rules() {
    echo -e "${YELLOW}Deploying WAF rules...${NC}"
    
    # Read WAF rules from JSON file
    local waf_rules=$(cat cloudflare/waf-rules.json | jq '.waf_rules')
    
    # Create ruleset for custom WAF rules
    local ruleset_data='{
        "name": "Casino Custom WAF Rules",
        "description": "Custom WAF rules for casino platform protection",
        "kind": "zone",
        "phase": "http_request_firewall_custom",
        "rules": []
    }'
    
    # Add rules to ruleset
    local rules_array="[]"
    for rule in $(echo "$waf_rules" | jq -r '.[] | @base64'); do
        local decoded_rule=$(echo "$rule" | base64 --decode)
        local rule_expression=$(echo "$decoded_rule" | jq -r '.rule.expression')
        local rule_action=$(echo "$decoded_rule" | jq -r '.rule.action')
        local rule_description=$(echo "$decoded_rule" | jq -r '.description')
        
        local new_rule="{
            \"action\": \"$rule_action\",
            \"expression\": \"$rule_expression\",
            \"description\": \"$rule_description\",
            \"enabled\": true
        }"
        
        rules_array=$(echo "$rules_array" | jq ". += [$new_rule]")
    done
    
    ruleset_data=$(echo "$ruleset_data" | jq ".rules = $rules_array")
    
    local response=$(cf_api_call "POST" "zones/$ZONE_ID/rulesets" "$ruleset_data")
    
    if echo "$response" | jq -e '.success' > /dev/null; then
        echo -e "${GREEN}✓ WAF rules deployed successfully${NC}"
    else
        echo -e "${RED}✗ Failed to deploy WAF rules${NC}"
        echo "$response" | jq '.errors'
    fi
}

# Configure rate limiting
configure_rate_limiting() {
    echo -e "${YELLOW}Configuring rate limiting...${NC}"
    
    # Authentication rate limit
    local auth_limit='{
        "threshold": 5,
        "period": 300,
        "match": {
            "request": {
                "methods": ["POST"],
                "schemes": ["HTTP", "HTTPS"],
                "url": "'$DOMAIN'/auth/*"
            }
        },
        "action": {
            "mode": "ban",
            "timeout": 3600
        },
        "correlate": {
            "by": "nat"
        },
        "disabled": false,
        "description": "Casino authentication rate limit"
    }'
    
    # API rate limit
    local api_limit='{
        "threshold": 100,
        "period": 60,
        "match": {
            "request": {
                "schemes": ["HTTP", "HTTPS"],
                "url": "'$DOMAIN'/api/*"
            }
        },
        "action": {
            "mode": "challenge",
            "timeout": 300
        },
        "correlate": {
            "by": "nat"
        },
        "disabled": false,
        "description": "Casino API rate limit"
    }'
    
    # Payment rate limit
    local payment_limit='{
        "threshold": 3,
        "period": 300,
        "match": {
            "request": {
                "methods": ["POST"],
                "schemes": ["HTTP", "HTTPS"],
                "url": "'$DOMAIN'/*payment*"
            }
        },
        "action": {
            "mode": "ban",
            "timeout": 1800
        },
        "correlate": {
            "by": "nat"
        },
        "disabled": false,
        "description": "Casino payment rate limit"
    }'
    
    # Deploy rate limits
    for limit_data in "$auth_limit" "$api_limit" "$payment_limit"; do
        local response=$(cf_api_call "POST" "zones/$ZONE_ID/rate_limits" "$limit_data")
        
        if echo "$response" | jq -e '.success' > /dev/null; then
            echo -e "${GREEN}✓ Rate limit rule deployed${NC}"
        else
            echo -e "${RED}✗ Failed to deploy rate limit rule${NC}"
            echo "$response" | jq '.errors'
        fi
    done
}

# Configure page rules for caching
configure_caching() {
    echo -e "${YELLOW}Configuring caching rules...${NC}"
    
    # Static assets caching
    local static_cache='{
        "targets": [
            {
                "target": "url",
                "constraint": {
                    "operator": "matches",
                    "value": "'$DOMAIN'/*.{css,js,png,jpg,jpeg,gif,ico,svg,woff,woff2,ttf,eot,webp,avif}"
                }
            }
        ],
        "actions": [
            {
                "id": "cache_level",
                "value": "cache_everything"
            },
            {
                "id": "edge_cache_ttl",
                "value": 31536000
            },
            {
                "id": "browser_cache_ttl",
                "value": 86400
            },
            {
                "id": "always_online",
                "value": "on"
            }
        ],
        "priority": 1,
        "status": "active"
    }'
    
    # API caching
    local api_cache='{
        "targets": [
            {
                "target": "url",
                "constraint": {
                    "operator": "matches",
                    "value": "'$DOMAIN'/api/games*"
                }
            }
        ],
        "actions": [
            {
                "id": "cache_level",
                "value": "cache_everything"
            },
            {
                "id": "edge_cache_ttl",
                "value": 300
            },
            {
                "id": "browser_cache_ttl",
                "value": 60
            }
        ],
        "priority": 2,
        "status": "active"
    }'
    
    # Admin bypass
    local admin_bypass='{
        "targets": [
            {
                "target": "url",
                "constraint": {
                    "operator": "matches",
                    "value": "'$DOMAIN'/admin*"
                }
            }
        ],
        "actions": [
            {
                "id": "cache_level",
                "value": "bypass"
            }
        ],
        "priority": 3,
        "status": "active"
    }'
    
    # Deploy page rules
    for rule_data in "$static_cache" "$api_cache" "$admin_bypass"; do
        local response=$(cf_api_call "POST" "zones/$ZONE_ID/pagerules" "$rule_data")
        
        if echo "$response" | jq -e '.success' > /dev/null; then
            echo -e "${GREEN}✓ Caching rule deployed${NC}"
        else
            echo -e "${RED}✗ Failed to deploy caching rule${NC}"
            echo "$response" | jq '.errors'
        fi
    done
}

# Main deployment function
main() {
    echo -e "${GREEN}🚀 Starting Cloudflare deployment for Casino Platform${NC}"
    echo -e "${YELLOW}Domain: $DOMAIN${NC}"
    echo -e "${YELLOW}Zone ID: $ZONE_ID${NC}"
    echo ""
    
    check_requirements
    configure_zone_settings
    deploy_waf_rules
    configure_rate_limiting
    configure_caching
    
    echo ""
    echo -e "${GREEN}🎉 Cloudflare deployment completed successfully!${NC}"
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "  1. Update your DNS records to point to Cloudflare"
    echo -e "  2. Enable 'Proxied' status for your DNS records"
    echo -e "  3. Test your application through Cloudflare"
    echo -e "  4. Monitor Cloudflare Analytics and Security Events"
}

# Run main function
main