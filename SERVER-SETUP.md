# Server Setup Script

This script automates the setup of your Oracle Cloud server for the Digitel hosting platform.

## Prerequisites

- Fresh Ubuntu 20.04 or 22.04 server
- Root or sudo access
- Domain pointed to server IP (140.238.243.1)

## Usage

```bash
# Download and run the setup script
wget https://raw.githubusercontent.com/yourusername/digitel/main/server-setup.sh
chmod +x server-setup.sh
sudo ./server-setup.sh
```

Or manually copy the script below and run it:

```bash
#!/bin/bash

# Digitel Server Setup Script
# This script sets up Apache, Node.js, and SSL for the Digitel hosting platform

set -e

echo "========================================="
echo "Digitel Server Setup"
echo "========================================="
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root (use sudo)" 
   exit 1
fi

# Update system
echo "Updating system packages..."
apt update && apt upgrade -y

# Install Apache
echo "Installing Apache..."
apt install -y apache2

# Enable Apache modules
echo "Enabling Apache modules..."
a2enmod rewrite
a2enmod headers
a2enmod ssl

# Start and enable Apache
systemctl enable apache2
systemctl start apache2

# Configure firewall
echo "Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 22/tcp
    ufw --force enable
fi

# Configure iptables (Oracle Cloud)
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT

# Install netfilter-persistent to save rules
apt install -y iptables-persistent netfilter-persistent
netfilter-persistent save

# Create web directories
echo "Creating web directories..."
mkdir -p /var/www/html/main
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

# Install Node.js
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Certbot
echo "Installing Certbot for SSL..."
apt install -y certbot python3-certbot-apache

# Install other useful tools
echo "Installing additional tools..."
apt install -y git curl wget unzip vim htop

# Create main site config
echo "Creating main site configuration..."
cat > /etc/apache2/sites-available/digitel.site.conf <<'EOF'
<VirtualHost *:80>
    ServerName digitel.site
    ServerAlias www.digitel.site
    DocumentRoot /var/www/html/main
    
    <Directory /var/www/html/main>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/digitel.site-error.log
    CustomLog ${APACHE_LOG_DIR}/digitel.site-access.log combined
</VirtualHost>
EOF

# Enable main site
a2ensite digitel.site.conf
systemctl reload apache2

# Create default index page
cat > /var/www/html/main/index.html <<'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Digitel - Setup Complete</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
        }
        h1 { color: #0ea5e9; }
    </style>
</head>
<body>
    <h1>Digitel Server Setup Complete!</h1>
    <p>Your server is ready for the Digitel hosting platform.</p>
    <p>Next steps:</p>
    <ol style="text-align: left;">
        <li>Configure SSL with: <code>sudo certbot --apache -d digitel.site -d www.digitel.site</code></li>
        <li>Setup wildcard SSL for subdomains</li>
        <li>Deploy the Appwrite function</li>
        <li>Deploy the frontend application</li>
    </ol>
</body>
</html>
EOF

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Configure SSL certificates:"
echo "   sudo certbot --apache -d digitel.site -d www.digitel.site"
echo ""
echo "2. For wildcard SSL (for subdomains):"
echo "   sudo certbot certonly --manual --preferred-challenges dns -d digitel.site -d *.digitel.site"
echo ""
echo "3. Test your site:"
echo "   Visit http://digitel.site in your browser"
echo ""
echo "4. Deploy your Appwrite function and frontend app"
echo ""
echo "Server is ready!"
```

## Manual SSL Configuration

After running the setup script, configure SSL:

### For Main Domain

```bash
sudo certbot --apache -d digitel.site -d www.digitel.site
```

### For Wildcard (Subdomains)

```bash
sudo certbot certonly --manual --preferred-challenges dns -d digitel.site -d *.digitel.site
```

Follow the prompts to add DNS TXT records.

### Create SSL Virtual Host

```bash
sudo nano /etc/apache2/sites-available/digitel.site-ssl.conf
```

Add the wildcard SSL configuration from the main README.

```bash
sudo a2ensite digitel.site-ssl.conf
sudo systemctl reload apache2
```

## Post-Setup Configuration

### Configure Sudoers for Appwrite Function

```bash
sudo visudo -f /etc/sudoers.d/appwrite-function
```

Add (adjust username as needed):

```
ubuntu ALL=(ALL) NOPASSWD: /usr/sbin/a2ensite, /usr/sbin/a2dissite, /usr/sbin/apache2ctl, /bin/systemctl reload apache2, /bin/chown, /bin/chmod, /usr/bin/find
```

### Setup Log Rotation

```bash
sudo nano /etc/logrotate.d/digitel
```

Add:

```
/var/www/html/*/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

### Setup Monitoring

Install basic monitoring:

```bash
# Install monitoring tools
sudo apt install -y sysstat

# Enable
sudo systemctl enable sysstat
sudo systemctl start sysstat
```

## Verification

Test your setup:

```bash
# Check Apache status
sudo systemctl status apache2

# Check Apache configuration
sudo apache2ctl -S

# Check listening ports
sudo netstat -tlnp | grep apache

# Test DNS
nslookup digitel.site

# Check disk space
df -h

# Check memory
free -h
```

## Backup Script

Create a backup script:

```bash
sudo nano /usr/local/bin/backup-digitel.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d)

mkdir -p $BACKUP_DIR

# Backup web files
tar -czf $BACKUP_DIR/web-$DATE.tar.gz /var/www/html

# Backup Apache configs
tar -czf $BACKUP_DIR/apache-$DATE.tar.gz /etc/apache2/sites-available

# Keep only last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable:

```bash
sudo chmod +x /usr/local/bin/backup-digitel.sh
```

Add to crontab:

```bash
sudo crontab -e
```

Add:

```
0 2 * * * /usr/local/bin/backup-digitel.sh
```

## Security Hardening

### Install Fail2Ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Configure SSH

```bash
sudo nano /etc/ssh/sshd_config
```

Recommended settings:

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Restart SSH:

```bash
sudo systemctl restart sshd
```

### Install UFW Firewall

```bash
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Maintenance

### Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Check Apache Logs

```bash
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/apache2/access.log
```

### Monitor Resources

```bash
# CPU and Memory
htop

# Disk usage
df -h
du -sh /var/www/html/*

# Network
sudo netstat -tulpn
```
