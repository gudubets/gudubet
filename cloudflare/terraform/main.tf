# Cloudflare Terraform Configuration for Casino Platform

terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

variable "zone_id" {
  description = "Cloudflare Zone ID"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the casino platform"
  type        = string
}

# Configure Cloudflare provider
provider "cloudflare" {
  # API token should be set via CLOUDFLARE_API_TOKEN environment variable
}

# Zone settings for optimal performance and security
resource "cloudflare_zone_settings_override" "casino_settings" {
  zone_id = var.zone_id

  settings {
    # Security settings
    security_level = "high"
    ssl           = "full"
    always_use_https = "on"
    automatic_https_rewrites = "on"
    
    # Performance settings
    brotli = "on"
    minify {
      css  = "on"
      js   = "on"
      html = "on"
    }
    
    # Caching
    cache_level = "aggressive"
    
    # Bot management
    bot_management {
      enable_js = true
    }
    
    # HTTP/3 support
    http3 = "on"
    
    # Browser integrity check
    browser_check = "on"
    
    # Challenge passage
    challenge_ttl = 1800
  }
}

# WAF Custom Rules
resource "cloudflare_ruleset" "casino_waf_custom" {
  zone_id     = var.zone_id
  name        = "Casino WAF Custom Rules"
  description = "Custom WAF rules for casino platform protection"
  kind        = "zone"
  phase       = "http_request_firewall_custom"

  # Casino Login Protection
  rule {
    action = "block"
    expression = "(http.request.uri.path contains \"/auth/login\" or http.request.uri.path contains \"/api/auth/login\") and (cf.rate_limit.requests_per_period > 8)"
    description = "Casino login brute force protection"
    enabled = true
  }

  # Payment endpoint protection
  rule {
    action = "block"
    expression = "(http.request.uri.path contains \"/api/payments\" or http.request.uri.path contains \"/api/withdrawals\" or http.request.uri.path contains \"/functions/v1/create-payment\" or http.request.uri.path contains \"/functions/v1/process-withdrawal\") and (cf.rate_limit.requests_per_period > 3)"
    description = "Payment endpoint protection"
    enabled = true
  }

  # Geographic compliance
  rule {
    action = "block"
    expression = "ip.geoip.country in {\"US\" \"AU\" \"BE\" \"BG\" \"CZ\" \"DK\" \"EE\" \"ES\" \"FR\" \"IT\" \"LV\" \"LT\" \"NL\" \"PL\" \"PT\" \"RO\" \"SE\" \"SK\" \"GB\"}"
    description = "Geographic compliance blocking"
    enabled = true
  }

  # Advanced bot protection
  rule {
    action = "managed_challenge"
    expression = "(cf.client.bot and not cf.verified_bot_category in {\"Search Engine\" \"Accessibility\"}) or (http.user_agent contains \"curl\" or http.user_agent contains \"wget\" or http.user_agent contains \"python\" or http.user_agent eq \"\")"
    description = "Advanced bot protection"
    enabled = true
  }
}

# Rate Limiting Rules
resource "cloudflare_rate_limit" "casino_auth_limit" {
  zone_id   = var.zone_id
  threshold = 5
  period    = 300
  match {
    request {
      url_pattern = "${var.domain_name}/auth/*"
      schemes     = ["HTTP", "HTTPS"]
      methods     = ["POST"]
    }
  }
  action {
    mode = "ban"
    timeout = 3600
  }
}

resource "cloudflare_rate_limit" "casino_api_limit" {
  zone_id   = var.zone_id
  threshold = 100
  period    = 60
  match {
    request {
      url_pattern = "${var.domain_name}/api/*"
      schemes     = ["HTTP", "HTTPS"]
    }
  }
  action {
    mode = "challenge"
    timeout = 300
  }
}

resource "cloudflare_rate_limit" "casino_payment_limit" {
  zone_id   = var.zone_id
  threshold = 3
  period    = 300
  match {
    request {
      url_pattern = "${var.domain_name}/*payment*"
      schemes     = ["HTTP", "HTTPS"]
      methods     = ["POST"]
    }
  }
  action {
    mode = "ban"
    timeout = 1800
  }
}

# Page Rules for Caching
resource "cloudflare_page_rule" "casino_static_assets" {
  zone_id  = var.zone_id
  target   = "${var.domain_name}/*.{css,js,png,jpg,jpeg,gif,ico,svg,woff,woff2,ttf,eot,webp,avif}"
  priority = 1

  actions {
    cache_level         = "cache_everything"
    edge_cache_ttl      = 31536000
    browser_cache_ttl   = 86400
    always_online       = "on"
  }
}

resource "cloudflare_page_rule" "casino_api_cache" {
  zone_id  = var.zone_id
  target   = "${var.domain_name}/api/games*"
  priority = 2

  actions {
    cache_level         = "cache_everything"
    edge_cache_ttl      = 300
    browser_cache_ttl   = 60
  }
}

resource "cloudflare_page_rule" "casino_bypass_admin" {
  zone_id  = var.zone_id
  target   = "${var.domain_name}/admin*"
  priority = 3

  actions {
    cache_level = "bypass"
  }
}

# Security Headers
resource "cloudflare_ruleset" "casino_security_headers" {
  zone_id     = var.zone_id
  name        = "Casino Security Headers"
  description = "Security headers for casino platform"
  kind        = "zone"
  phase       = "http_response_headers_transform"

  rule {
    action = "rewrite"
    expression = "true"
    description = "Add security headers"
    enabled = true
    
    action_parameters {
      headers {
        "Strict-Transport-Security" = "max-age=31536000; includeSubDomains; preload"
        "X-Content-Type-Options" = "nosniff"
        "X-Frame-Options" = "DENY" 
        "X-XSS-Protection" = "1; mode=block"
        "Referrer-Policy" = "strict-origin-when-cross-origin"
        "Permissions-Policy" = "geolocation=(), microphone=(), camera=(), payment=(self)"
      }
    }
  }
}

# Load Balancing (if using multiple origins)
resource "cloudflare_load_balancer_pool" "casino_pool" {
  account_id = var.zone_id
  name       = "casino-origin-pool"
  
  origins {
    name    = "casino-primary"
    address = var.domain_name
    enabled = true
    weight  = 1
  }
  
  check_regions = ["WNAM", "ENAM", "WEU", "EEU", "SEAS"]
  
  monitor = cloudflare_load_balancer_monitor.casino_monitor.id
}

resource "cloudflare_load_balancer_monitor" "casino_monitor" {
  account_id     = var.zone_id
  type           = "https"
  expected_codes = "200"
  method         = "GET"
  path           = "/health"
  header {
    header = "Host"
    values = [var.domain_name]
  }
}

# DNS Records
resource "cloudflare_record" "casino_root" {
  zone_id = var.zone_id
  name    = "@"
  value   = "your-origin-server-ip" # Replace with actual IP
  type    = "A"
  proxied = true
}

resource "cloudflare_record" "casino_www" {
  zone_id = var.zone_id
  name    = "www"
  value   = var.domain_name
  type    = "CNAME"
  proxied = true
}

# Output important information
output "zone_id" {
  value = var.zone_id
}

output "security_rules_created" {
  value = "WAF, Rate Limiting, and Security Headers configured"
}