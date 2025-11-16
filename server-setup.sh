#!/bin/bash

# Digitel Server Setup Script
# This script automates the setup of Apache, Node.js, and basic configuration

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
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Apache
echo "🌐 Installing Apache..."
apt install -y apache2

# Enable Apache modules
echo "🔧 Enabling Apache modules..."
a2enmod rewrite
a2enmod headers
a2enmod ssl

# Start and enable Apache
systemctl enable apache2
systemctl start apache2

# Configure firewall for Oracle Cloud
echo "🔥 Configuring firewall..."
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT

# Install netfilter-persistent to save rules
apt install -y iptables-persistent netfilter-persistent
netfilter-persistent save

# Create web directories
echo "📁 Creating web directories..."
mkdir -p /var/www/html/main
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

# Install Node.js
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Certbot
echo "🔒 Installing Certbot for SSL..."
apt install -y certbot python3-certbot-apache

# Install other useful tools
echo "🛠️ Installing additional tools..."
apt install -y git curl wget unzip vim htop

# Create main site config
echo "⚙️ Creating main site configuration..."
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
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Digitel - Setup Complete</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 800px;
            padding: 60px 40px;
            text-align: center;
        }
        h1 {
            color: #667eea;
            font-size: 3rem;
            margin-bottom: 20px;
        }
        .checkmark {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: block;
            stroke-width: 3;
            stroke: #4caf50;
            stroke-miterlimit: 10;
            margin: 40px auto;
            box-shadow: inset 0px 0px 0px #4caf50;
            animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
        }
        .checkmark__circle {
            stroke-dasharray: 166;
            stroke-dashoffset: 166;
            stroke-width: 3;
            stroke-miterlimit: 10;
            stroke: #4caf50;
            fill: none;
            animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .checkmark__check {
            transform-origin: 50% 50%;
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
            animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }
        @keyframes stroke {
            100% { stroke-dashoffset: 0; }
        }
        @keyframes scale {
            0%, 100% { transform: none; }
            50% { transform: scale3d(1.1, 1.1, 1); }
        }
        @keyframes fill {
            100% { box-shadow: inset 0px 0px 0px 30px #4caf50; }
        }
        .subtitle {
            font-size: 1.2rem;
            color: #666;
            margin-bottom: 40px;
        }
        .steps {
            text-align: left;
            background: #f5f5f5;
            border-radius: 10px;
            padding: 30px;
            margin-top: 30px;
        }
        .steps h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 1.5rem;
        }
        .steps ol {
            padding-left: 20px;
        }
        .steps li {
            margin: 15px 0;
            line-height: 1.6;
            color: #555;
        }
        code {
            background: #e0e0e0;
            padding: 3px 8px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            color: #d63384;
        }
        .footer {
            margin-top: 40px;
            color: #999;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
        
        <h1>🚀 Digitel Server</h1>
        <p class="subtitle">Server setup complete! Your platform is almost ready.</p>
        
        <div class="steps">
            <h2>Next Steps:</h2>
            <ol>
                <li>Configure SSL certificates:
                    <br><code>sudo certbot --apache -d digitel.site -d www.digitel.site</code>
                </li>
                <li>Setup wildcard SSL for subdomains:
                    <br><code>sudo certbot certonly --manual --preferred-challenges dns -d digitel.site -d *.digitel.site</code>
                </li>
                <li>Deploy the Appwrite function to handle deployments</li>
                <li>Build and deploy the React frontend application</li>
                <li>Test your first deployment!</li>
            </ol>
        </div>
        
        <div class="footer">
            <p>Digitel Hosting Platform v1.0</p>
            <p>Apache is running • Node.js installed • Ready for SSL</p>
        </div>
    </div>
</body>
</html>
EOF

# Create backup directory
mkdir -p /backups

echo ""
echo "========================================="
echo "✅ Setup Complete!"
echo "========================================="
echo ""
echo "Server Information:"
echo "  • Apache: $(apache2 -v | head -n 1)"
echo "  • Node.js: $(node --version)"
echo "  • npm: $(npm --version)"
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
echo "🎉 Server is ready for Digitel!"
echo ""
