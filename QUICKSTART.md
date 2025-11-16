# Quick Start Guide

## For Developers Using the Platform

### 1. Build Your Frontend App

```bash
# React
npm run build

# Vue
npm run build

# Angular
ng build --prod

# Next.js (static export)
npm run build && npm run export
```

### 2. Deploy to Digitel

1. Visit https://digitel.site
2. Sign up / Log in
3. Click "New Deployment"
4. Fill in:
   - Project Name: `My Awesome App`
   - Subdomain: `my-app` (will become my-app.digitel.site)
5. Upload your build folder (dist, build, out, etc.)
6. Click "Deploy"
7. Wait ~30 seconds
8. Your site is live at https://my-app.digitel.site

### Tips for Best Results

- Always upload the **build output folder**, not source code
- Include an `index.html` file in the root
- For SPAs, ensure your app handles routing correctly
- Test your build locally first: `npx serve dist`

## For Platform Administrators

### Server Maintenance

#### Check Apache Status

```bash
sudo systemctl status apache2
```

#### View Apache Error Logs

```bash
sudo tail -f /var/log/apache2/error.log
```

#### List All Sites

```bash
ls -la /etc/apache2/sites-available/
ls -la /var/www/html/
```

#### Check SSL Certificate

```bash
sudo certbot certificates
```

#### Renew SSL

```bash
sudo certbot renew
sudo systemctl reload apache2
```

### Monitor Disk Usage

```bash
df -h
du -sh /var/www/html/*
```

### Backup Projects

```bash
# Backup all projects
sudo tar -czf /backups/projects-$(date +%Y%m%d).tar.gz /var/www/html

# Restore
sudo tar -xzf /backups/projects-YYYYMMDD.tar.gz -C /
```

### Remove Inactive Projects

```bash
# Find projects older than 90 days
find /var/www/html -type d -mtime +90

# Remove (be careful!)
# sudo rm -rf /var/www/html/old-project
```

## DNS Configuration

### Add Wildcard DNS Record

In your DNS provider (e.g., Cloudflare, Namecheap):

1. Add A Record:
   - Type: `A`
   - Name: `@`
   - Value: `140.238.243.1`
   - TTL: Auto

2. Add Wildcard A Record:
   - Type: `A`
   - Name: `*`
   - Value: `140.238.243.1`
   - TTL: Auto

3. Add CNAME for www:
   - Type: `CNAME`
   - Name: `www`
   - Value: `digitel.site`
   - TTL: Auto

### Verify DNS Propagation

```bash
# Check main domain
nslookup digitel.site

# Check subdomain
nslookup test.digitel.site

# Check from different DNS servers
nslookup digitel.site 8.8.8.8
```

## Appwrite Setup Checklist

- [ ] Create Appwrite project
- [ ] Enable Email/Password auth
- [ ] Configure GitHub OAuth (optional)
- [ ] Create database "production"
- [ ] Create collection "projects" with correct schema
- [ ] Create storage bucket "project-files"
- [ ] Deploy cloud function
- [ ] Set environment variables
- [ ] Configure function permissions
- [ ] Test function execution

## Common Commands

### Restart Services

```bash
# Restart Apache
sudo systemctl restart apache2

# Reload Apache (faster, no downtime)
sudo systemctl reload apache2

# Check Apache config syntax
sudo apache2ctl configtest
```

### Test Deployment Manually

```bash
# Create test directory
sudo mkdir -p /var/www/html/test

# Create test index.html
echo "<h1>Test Site</h1>" | sudo tee /var/www/html/test/index.html

# Create vhost config
sudo nano /etc/apache2/sites-available/test.digitel.site.conf
```

Add:

```apache
<VirtualHost *:80>
    ServerName test.digitel.site
    DocumentRoot /var/www/html/test
    <Directory /var/www/html/test>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

Enable:

```bash
sudo a2ensite test.digitel.site.conf
sudo systemctl reload apache2
```

Test: Visit http://test.digitel.site

## Troubleshooting Steps

### Site Not Loading

1. Check if Apache is running
2. Check DNS resolution
3. Check firewall rules
4. Check Apache vhost config
5. Check file permissions
6. Check Apache logs

### SSL Issues

1. Verify certificate: `sudo certbot certificates`
2. Check SSL config in vhost
3. Ensure port 443 is open
4. Check Apache SSL module: `sudo a2enmod ssl`
5. Restart Apache

### Permission Denied

```bash
# Fix permissions
sudo chown -R www-data:www-data /var/www/html/projectname
sudo find /var/www/html/projectname -type d -exec chmod 755 {} \;
sudo find /var/www/html/projectname -type f -exec chmod 644 {} \;
```

### Out of Disk Space

```bash
# Check usage
df -h

# Find large directories
du -sh /var/www/html/* | sort -rh | head -10

# Clean up
sudo apt autoremove
sudo apt clean
```
