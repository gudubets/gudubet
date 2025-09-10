# Cloudflare Configuration for Casino Platform

This directory contains Cloudflare configuration files for comprehensive security, performance, and compliance setup for the casino gaming platform.

## 🔧 Setup Requirements

### Prerequisites
- Cloudflare account with your domain added
- API Token with Zone:Edit permissions
- Zone ID for your domain
- `jq` command-line tool for JSON processing

### Environment Variables
Set these environment variables before deployment:

```bash
export CLOUDFLARE_API_TOKEN="your_api_token_here"
export CLOUDFLARE_ZONE_ID="your_zone_id_here"
export CLOUDFLARE_DOMAIN="yourdomain.com"
```

## 🚀 Quick Deployment

### Option 1: Automated Script Deployment
```bash
chmod +x cloudflare/deploy-cloudflare.sh
./cloudflare/deploy-cloudflare.sh
```

### Option 2: Terraform Deployment
```bash
cd cloudflare/terraform
terraform init
terraform plan -var="zone_id=$CLOUDFLARE_ZONE_ID" -var="domain_name=$CLOUDFLARE_DOMAIN"
terraform apply -var="zone_id=$CLOUDFLARE_ZONE_ID" -var="domain_name=$CLOUDFLARE_DOMAIN"
```

## 🛡️ Security Features Configured

### WAF (Web Application Firewall)
- **Login Protection**: Rate limiting on authentication endpoints (5 attempts per 5 minutes)
- **Admin Panel Protection**: Enhanced protection for `/admin` routes
- **Payment Security**: Ultra-strict limits on payment/withdrawal endpoints (3 attempts per 5 minutes)
- **Geographic Compliance**: Blocks traffic from restricted jurisdictions
- **Bot Protection**: Advanced bot detection and mitigation
- **SQL Injection Protection**: Pattern-based SQL injection detection
- **XSS Protection**: Cross-site scripting prevention
- **Suspicious User Agent Blocking**: Blocks known attack tools and suspicious agents

### Rate Limiting Rules
1. **Authentication Endpoints**: 5 requests per 5 minutes, ban for 1 hour
2. **API Endpoints**: 100 requests per minute, challenge for 5 minutes
3. **Payment Endpoints**: 3 requests per 5 minutes, ban for 30 minutes
4. **Game Launch**: 20 requests per minute, JS challenge for 5 minutes

### Geographic Restrictions
Automatically blocks traffic from jurisdictions where online gambling is restricted:
- United States (US)
- Australia (AU)
- European restricted countries: BE, BG, CZ, DK, EE, ES, FR, IT, LV, LT, NL, PL, PT, RO, SE, SK
- United Kingdom (GB)

## ⚡ Performance Optimization

### Caching Strategy
1. **Static Assets**: 1-year edge cache, 1-day browser cache
2. **Game Assets**: 1-hour edge cache, 30-minute browser cache
3. **API Responses**: 5-minute edge cache, 1-minute browser cache
4. **Public Pages**: 30-minute edge cache, 15-minute browser cache
5. **Dynamic Content**: Cache bypass for admin, profile, dashboard

### Security Headers
- Strict-Transport-Security (HSTS)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy
- Content-Security-Policy
- Permissions-Policy

## 📊 Monitoring and Analytics

### Key Metrics to Monitor
1. **Security Events**: WAF blocks, rate limit triggers
2. **Performance Metrics**: Cache hit ratio, response times
3. **Traffic Patterns**: Geographic distribution, bot traffic
4. **Availability**: Uptime monitoring, origin health

### Cloudflare Dashboard Sections
- **Analytics > Security**: WAF events and bot traffic
- **Analytics > Traffic**: Bandwidth and requests
- **Security > Events**: Real-time security events
- **Speed > Optimization**: Caching and performance metrics

## 🔐 Security Best Practices

### Regular Maintenance
1. **Review WAF Logs**: Weekly review of blocked requests
2. **Update Rate Limits**: Adjust based on legitimate traffic patterns  
3. **Geographic Updates**: Update restricted countries as regulations change
4. **Bot Management**: Fine-tune bot protection rules

### Incident Response
1. **DDoS Attack**: Enable "Under Attack Mode" in Cloudflare
2. **Suspicious Activity**: Temporarily lower rate limits
3. **False Positives**: Whitelist legitimate traffic patterns
4. **Compliance Issues**: Update geographic blocking rules

## 📁 File Structure

```
cloudflare/
├── waf-rules.json           # WAF, rate limiting, and cache rules
├── terraform/
│   └── main.tf             # Terraform configuration
├── deploy-cloudflare.sh    # Automated deployment script
└── README.md               # This documentation
```

## 🧪 Testing Configuration

### Test WAF Rules
```bash
# Test rate limiting (should be blocked after 5 attempts)
for i in {1..10}; do curl -X POST https://yourdomain.com/auth/login; done

# Test geographic blocking (use VPN to restricted country)
curl -H "CF-IPCountry: US" https://yourdomain.com/

# Test bot protection
curl -A "curl/7.68.0" https://yourdomain.com/
```

### Test Caching
```bash
# Check cache headers
curl -I https://yourdomain.com/assets/main.css
curl -I https://yourdomain.com/api/games
```

## 🚨 Troubleshooting

### Common Issues
1. **False Positive Blocks**: Check Security Events in Cloudflare dashboard
2. **Cache Issues**: Purge cache from Cloudflare dashboard
3. **Rate Limit Too Strict**: Adjust thresholds in configuration
4. **Geographic False Blocks**: Review IP geolocation accuracy

### Emergency Procedures
1. **Disable WAF**: Set Security Level to "Essentially Off"
2. **Disable Rate Limiting**: Temporarily disable rules
3. **Bypass Cache**: Add bypass page rule
4. **Enable Development Mode**: Bypass all caching

## 📞 Support

For Cloudflare-specific issues:
- Cloudflare Support: https://support.cloudflare.com/
- Community Forum: https://community.cloudflare.com/
- Status Page: https://www.cloudflarestatus.com/

For configuration questions, refer to the Cloudflare API documentation:
- https://developers.cloudflare.com/api/

## 🔄 Updates and Maintenance

Regular updates recommended:
- Monthly review of security rules effectiveness
- Quarterly update of geographic restrictions
- Semi-annual performance optimization review
- Annual security audit and penetration testing

---

**⚠️ Important Notes:**
- Always test configuration changes in a staging environment first
- Monitor traffic patterns after any rule changes
- Keep backups of working configurations
- Ensure compliance with local gambling regulations