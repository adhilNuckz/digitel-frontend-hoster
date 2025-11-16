# Deployment Checklist

Complete guide for deploying the Digitel hosting platform from scratch.

## Phase 1: Domain & DNS Setup ✓

- [x] Domain acquired: digitel.site
- [x] DNS pointed to Oracle Cloud IP: 140.238.243.1
- [ ] Verify DNS propagation (wait 24-48 hours)

```bash
# Check DNS
nslookup digitel.site
nslookup www.digitel.site
```

## Phase 2: Server Setup

### 2.1 Initial Server Configuration

- [ ] SSH into server
- [ ] Update system packages
- [ ] Configure firewall
- [ ] Set up swap (if needed)

```bash
# SSH into server
ssh ubuntu@140.238.243.1

# Update
sudo apt update && sudo apt upgrade -y

# Configure Oracle Cloud firewall (iptables)
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo apt install -y iptables-persistent netfilter-persistent
sudo netfilter-persistent save
```

### 2.2 Install Apache

- [ ] Install Apache2
- [ ] Enable required modules
- [ ] Start and enable service
- [ ] Create web directories

```bash
# Install Apache
sudo apt install -y apache2

# Enable modules
sudo a2enmod rewrite headers ssl

# Start service
sudo systemctl enable apache2
sudo systemctl start apache2

# Create directories
sudo mkdir -p /var/www/html/main
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

### 2.3 Configure Main Domain

- [ ] Create virtual host configuration
- [ ] Enable site
- [ ] Test Apache configuration

```bash
# Create main site config (see SERVER-SETUP.md for full config)
sudo nano /etc/apache2/sites-available/digitel.site.conf

# Enable site
sudo a2ensite digitel.site.conf

# Test config
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2
```

### 2.4 Install SSL Certificates

- [ ] Install Certbot
- [ ] Get SSL for main domain
- [ ] Get wildcard SSL for subdomains
- [ ] Configure SSL virtual hosts
- [ ] Setup auto-renewal

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-apache

# Get certificate for main domain
sudo certbot --apache -d digitel.site -d www.digitel.site

# Get wildcard certificate (requires DNS verification)
sudo certbot certonly --manual --preferred-challenges dns -d digitel.site -d *.digitel.site

# Follow prompts to add TXT records to your DNS
```

After getting wildcard cert, create SSL config (see SERVER-SETUP.md).

```bash
# Enable SSL site
sudo a2ensite digitel.site-ssl.conf
sudo systemctl reload apache2
```

### 2.5 Install Node.js

- [ ] Install Node.js 18+
- [ ] Verify installation

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

## Phase 3: Appwrite Configuration

### 3.1 Create Appwrite Project

- [ ] Sign up/Login at cloud.appwrite.io
- [ ] Create new project "Digitel"
- [ ] Note down Project ID

### 3.2 Configure Authentication

- [ ] Enable Email/Password authentication
- [ ] Configure GitHub OAuth (optional)
  - [ ] Create GitHub OAuth App
  - [ ] Add credentials to Appwrite

### 3.3 Create Database

- [ ] Create database "production"
- [ ] Create collection "projects"
- [ ] Add attributes (see README.md for schema):
  - userId (string, required)
  - projectName (string, required)
  - subdomain (string, required)
  - status (string, required, default: "pending")
  - url (string, optional)
  - createdAt (string, required)
- [ ] Create indexes:
  - userId (key index)
  - subdomain (unique index)
- [ ] Set permissions (read/create/update/delete: user:*)

### 3.4 Create Storage Bucket

- [ ] Create bucket "project-files"
- [ ] Set max file size: 50MB
- [ ] Set permissions (read/create/delete: user:*)

### 3.5 Deploy Cloud Function

- [ ] Install Appwrite CLI

```powershell
npm install -g appwrite-cli
```

- [ ] Login to Appwrite

```powershell
appwrite login
```

- [ ] Navigate to function directory

```powershell
cd appwrite-functions/deploy
```

- [ ] Create function in Appwrite Console
  - Name: "Deploy Function"
  - Runtime: Node.js 18+
  - Entry point: src/main.js
- [ ] Set environment variables in Appwrite Console:
  - APPWRITE_API_KEY (generate from Settings > API Keys)
- [ ] Deploy function

```powershell
appwrite deploy function
```

OR manually upload via Appwrite Console.

### 3.6 Configure Function Permissions on Server

- [ ] Create sudoers file for function execution

```bash
sudo visudo -f /etc/sudoers.d/appwrite-function
```

Add (adjust username as needed):

```
ubuntu ALL=(ALL) NOPASSWD: /usr/sbin/a2ensite, /usr/sbin/a2dissite, /usr/sbin/apache2ctl, /bin/systemctl reload apache2, /bin/chown, /bin/chmod, /usr/bin/find
```

## Phase 4: Frontend Deployment

### 4.1 Configure Environment Variables

- [ ] Copy .env.example to .env
- [ ] Fill in all Appwrite IDs from Phase 3

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DATABASE_ID=your_database_id_here
VITE_APPWRITE_PROJECTS_COLLECTION_ID=your_collection_id_here
VITE_APPWRITE_BUCKET_ID=your_bucket_id_here
VITE_APPWRITE_DEPLOY_FUNCTION_ID=your_function_id_here
VITE_APP_DOMAIN=digitel.site
```

### 4.2 Install Dependencies

```powershell
npm install
```

### 4.3 Test Locally

```powershell
npm run dev
```

Visit http://localhost:3000 and test:
- [ ] Sign up works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Can open deployment modal

### 4.4 Build Production

```powershell
npm run build
```

### 4.5 Deploy to Server

```bash
# From local machine
scp -r dist ubuntu@140.238.243.1:/tmp/digitel-app

# On server
ssh ubuntu@140.238.243.1
sudo rm -rf /var/www/html/main/*
sudo mv /tmp/digitel-app/* /var/www/html/main/
sudo chown -R www-data:www-data /var/www/html/main
sudo chmod -R 755 /var/www/html/main
```

## Phase 5: Testing

### 5.1 Test Main Site

- [ ] Visit https://digitel.site
- [ ] Landing page loads correctly
- [ ] SSL certificate is valid
- [ ] No console errors

### 5.2 Test Authentication

- [ ] Sign up with email/password
- [ ] Logout
- [ ] Login
- [ ] Test GitHub OAuth (if configured)

### 5.3 Test Deployment

- [ ] Create a simple test project locally

```bash
mkdir test-site
cd test-site
echo "<h1>Hello Digitel!</h1>" > index.html
```

- [ ] Login to Digitel dashboard
- [ ] Click "New Deployment"
- [ ] Fill in:
  - Project Name: Test Site
  - Subdomain: test
- [ ] Upload test-site folder
- [ ] Click Deploy
- [ ] Wait for deployment to complete
- [ ] Visit https://test.digitel.site
- [ ] Verify site is live

### 5.4 Test Project Management

- [ ] View project in dashboard
- [ ] Click "Visit" button
- [ ] Delete project
- [ ] Verify site is removed

## Phase 6: Security & Optimization

### 6.1 Security Hardening

- [ ] Install Fail2Ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

- [ ] Configure SSH (disable root login, password auth)
- [ ] Install UFW firewall (optional, careful with Oracle Cloud)
- [ ] Setup rate limiting in Apache
- [ ] Review Apache security headers

### 6.2 Monitoring Setup

- [ ] Install monitoring tools

```bash
sudo apt install -y htop sysstat
```

- [ ] Setup log rotation
- [ ] Create backup script
- [ ] Test backup restoration

### 6.3 Performance Optimization

- [ ] Enable Apache compression
- [ ] Configure browser caching
- [ ] Consider adding Cloudflare (optional)

## Phase 7: Documentation & Maintenance

### 7.1 Create Operational Docs

- [ ] Document server access
- [ ] Document Appwrite credentials
- [ ] Create incident response plan
- [ ] Setup monitoring alerts

### 7.2 Setup Automated Tasks

- [ ] SSL renewal (certbot auto-renews)
- [ ] Backup schedule
- [ ] Update schedule
- [ ] Disk cleanup

```bash
# Add to crontab
sudo crontab -e

# SSL renewal (already automatic with certbot)
# 0 12 * * * /usr/bin/certbot renew --quiet

# Backup
# 0 2 * * * /usr/local/bin/backup-digitel.sh

# Cleanup old deployments (optional, create script)
# 0 3 * * 0 /usr/local/bin/cleanup-old-sites.sh
```

## Post-Deployment

### Verify Everything Works

- [ ] Main site accessible (https://digitel.site)
- [ ] SSL valid on main site
- [ ] Can sign up new user
- [ ] Can deploy test project
- [ ] Test subdomain accessible with SSL
- [ ] Can delete project
- [ ] Dashboard shows correct project list

### Announce Launch

- [ ] Update DNS if needed
- [ ] Share with beta testers
- [ ] Monitor for issues
- [ ] Collect feedback

## Troubleshooting Common Issues

### DNS Not Resolving

- Wait 24-48 hours for DNS propagation
- Check DNS records in your registrar
- Use `nslookup` to verify

### SSL Certificate Issues

```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check Apache SSL config
sudo apache2ctl -S | grep 443
```

### Function Execution Fails

- Check Appwrite function logs
- Verify environment variables
- Check sudoers configuration
- Test Apache commands manually

### Site Not Accessible

```bash
# Check Apache status
sudo systemctl status apache2

# Check Apache logs
sudo tail -f /var/log/apache2/error.log

# Check vhost config
sudo apache2ctl -S

# Test config
sudo apache2ctl configtest
```

### Permission Issues

```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/html

# Fix permissions
sudo find /var/www/html -type d -exec chmod 755 {} \;
sudo find /var/www/html -type f -exec chmod 644 {} \;
```

## Support

If you encounter issues:

1. Check Apache error logs: `/var/log/apache2/error.log`
2. Check Appwrite function logs in console
3. Review this checklist for missed steps
4. Consult README.md for detailed instructions
5. Check QUICKSTART.md for common solutions

## Success Criteria

✅ Main site accessible via HTTPS
✅ Can sign up and login
✅ Can deploy test project
✅ Test subdomain accessible via HTTPS
✅ Can delete projects
✅ No errors in browser console
✅ No errors in Apache logs
✅ SSL certificates valid
✅ All security measures in place

---

**Congratulations!** 🎉 Your Digitel hosting platform is now live!
