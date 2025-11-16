# Digitel - Frontend Hosting Platform

A simplified frontend hosting platform similar to Netlify, built with React and Appwrite.

## 🚀 Features

- **Easy Deployment**: Upload your build folder and go live instantly
- **Custom Subdomains**: Get your own subdomain (yourname.digitel.site)
- **GitHub OAuth**: Sign in with GitHub or email/password
- **SSL Support**: HTTPS enabled with automatic SSL certificate generation
- **Simple Dashboard**: Manage all your deployed projects in one place

## 🛠️ Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Appwrite (Auth, Database, Storage, Functions)
- **Hosting**: Apache on Oracle Cloud (140.238.243.1)
- **Domain**: digitel.site

## 📋 Prerequisites

- Node.js 18+ installed
- Appwrite account (cloud.appwrite.io or self-hosted)
- Oracle Cloud server with Ubuntu
- Domain pointed to your server (digitel.site → 140.238.243.1)

## 🔧 Setup Instructions

### 1. Frontend Setup

```powershell
# Clone/Navigate to project
cd "c:\Users\Death\Desktop\projects\FrontEnd Hoster"

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env and add your Appwrite credentials
```

### 2. Appwrite Project Setup

#### Create Appwrite Project

1. Go to https://cloud.appwrite.io
2. Create a new project named "Digitel"
3. Note your Project ID

#### Configure Authentication

1. Go to **Auth** → **Settings**
2. Enable **Email/Password** authentication
3. Enable **GitHub OAuth**:
   - Go to GitHub → Settings → Developer Settings → OAuth Apps
   - Create new OAuth App:
     - Homepage URL: `https://digitel.site`
     - Callback URL: `https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/github/your_project_id`
   - Copy Client ID and Client Secret to Appwrite

#### Create Database

1. Go to **Databases** → Create Database
2. Name it "production"
3. Create Collection "projects" with these attributes:
   - `userId` (String, required)
   - `projectName` (String, required)
   - `subdomain` (String, required, unique)
   - `status` (String, required, default: "pending")
   - `url` (String, optional)
   - `createdAt` (String, required)

4. Set Permissions:
   - Read: `user:*` (any authenticated user)
   - Create: `user:*`
   - Update: `user:*`
   - Delete: `user:*`

#### Create Storage Bucket

1. Go to **Storage** → Create Bucket
2. Name it "project-files"
3. Set max file size: 50MB
4. Allowed file extensions: * (all)
5. Set Permissions:
   - Read: `user:*`
   - Create: `user:*`
   - Delete: `user:*`

#### Update .env File

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DATABASE_ID=your_database_id_here
VITE_APPWRITE_PROJECTS_COLLECTION_ID=your_collection_id_here
VITE_APPWRITE_BUCKET_ID=your_bucket_id_here
VITE_APPWRITE_DEPLOY_FUNCTION_ID=your_function_id_here
VITE_APP_DOMAIN=digitel.site
```

### 3. Server Setup (Oracle Cloud)

#### SSH into your server:

```bash
ssh ubuntu@140.238.243.1
```

#### Install Apache:

```bash
sudo apt update
sudo apt install -y apache2
sudo systemctl enable apache2
sudo systemctl start apache2
```

#### Enable required Apache modules:

```bash
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod ssl
sudo systemctl restart apache2
```

#### Create web directory:

```bash
sudo mkdir -p /var/www/html
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

#### Configure Firewall:

```bash
# Allow HTTP and HTTPS
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

#### Setup main domain virtual host:

```bash
sudo nano /etc/apache2/sites-available/digitel.site.conf
```

Add:

```apache
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
```

Enable the site:

```bash
sudo mkdir -p /var/www/html/main
sudo a2ensite digitel.site.conf
sudo systemctl reload apache2
```

#### Install Certbot for SSL:

```bash
sudo apt install -y certbot python3-certbot-apache
```

#### Configure wildcard SSL:

```bash
sudo certbot certonly --manual --preferred-challenges dns -d digitel.site -d *.digitel.site
```

Follow the prompts to add DNS TXT records. Then create SSL config:

```bash
sudo nano /etc/apache2/sites-available/digitel.site-ssl.conf
```

Add:

```apache
<VirtualHost *:443>
    ServerName digitel.site
    ServerAlias www.digitel.site
    DocumentRoot /var/www/html/main
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/digitel.site/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/digitel.site/privkey.pem
    
    <Directory /var/www/html/main>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/digitel.site-error.log
    CustomLog ${APACHE_LOG_DIR}/digitel.site-access.log combined
</VirtualHost>

# Wildcard SSL for subdomains
<VirtualHost *:443>
    ServerName *.digitel.site
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/digitel.site/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/digitel.site/privkey.pem
    
    # This will be overridden by individual vhosts
    VirtualDocumentRoot /var/www/html/%1
    
    <Directory /var/www/html/*>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

Enable SSL:

```bash
sudo a2enmod ssl
sudo a2ensite digitel.site-ssl.conf
sudo systemctl reload apache2
```

#### Setup automatic SSL renewal:

```bash
sudo crontab -e
```

Add:

```
0 12 * * * /usr/bin/certbot renew --quiet
```

#### Install Node.js (for Appwrite Function):

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 4. Deploy Appwrite Function

#### Option A: Using Appwrite CLI (Recommended)

Install Appwrite CLI:

```powershell
npm install -g appwrite-cli
```

Login to Appwrite:

```powershell
appwrite login
```

Navigate to function directory:

```powershell
cd appwrite-functions/deploy
```

Deploy function:

```powershell
appwrite deploy function
```

#### Option B: Manual Deployment via Console

1. Go to Appwrite Console → **Functions**
2. Create new function:
   - Name: "Deploy Function"
   - Runtime: Node.js 18+
   - Entry point: `src/main.js`
3. Upload the `appwrite-functions/deploy` folder
4. Set environment variables:
   - `APPWRITE_API_KEY`: Generate from API Keys section
5. Configure Execute permissions:
   - Add `user:*` to allow authenticated users
6. Deploy the function

#### Configure Function Permissions on Server

The function needs sudo access to manage Apache. Create a sudoers file:

```bash
sudo visudo -f /etc/sudoers.d/appwrite-function
```

Add (replace `appwrite` with your function execution user):

```
appwrite ALL=(ALL) NOPASSWD: /usr/sbin/a2ensite, /usr/sbin/a2dissite, /usr/sbin/apache2ctl, /bin/systemctl reload apache2, /bin/chown, /bin/chmod, /usr/bin/find
```

### 5. Deploy Frontend to Production

#### Build the React app:

```powershell
npm run build
```

#### Deploy to server:

```bash
# On your local machine
scp -r dist ubuntu@140.238.243.1:/tmp/digitel-app

# On server
ssh ubuntu@140.238.243.1
sudo mv /tmp/digitel-app/* /var/www/html/main/
sudo chown -R www-data:www-data /var/www/html/main
sudo chmod -R 755 /var/www/html/main
```

## 🚀 Running Locally

```powershell
npm run dev
```

Visit http://localhost:3000

## 📁 Project Structure

```
FrontEnd Hoster/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── DeploymentForm.jsx
│   ├── context/             # React Context
│   │   └── AuthContext.jsx
│   ├── lib/                 # Appwrite services
│   │   ├── appwrite.js
│   │   ├── auth.js
│   │   ├── database.js
│   │   ├── storage.js
│   │   └── deployment.js
│   ├── pages/               # Page components
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   └── Dashboard.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── appwrite-functions/
│   └── deploy/              # Appwrite Function
│       ├── src/
│       │   └── main.js
│       ├── package.json
│       └── README.md
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔒 Security Best Practices

### Implemented Security Measures:

1. **Authentication**: Appwrite handles secure authentication
2. **Input Validation**: 
   - Subdomain names are validated (alphanumeric + hyphens only)
   - File types are checked
   - Path traversal prevention
3. **Apache Security**:
   - Directory indexing disabled
   - Security headers enabled (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
   - .htaccess files for additional security
4. **File Permissions**:
   - Files: 644 (read-only for public)
   - Directories: 755
   - Owner: www-data (Apache user)
5. **SSL/HTTPS**: All traffic encrypted
6. **Rate Limiting**: Configure in Apache or use Cloudflare
7. **Forbidden Subdomains**: admin, api, www, mail, ftp, root, test

### Additional Recommendations:

1. **Setup Cloudflare**: Add your domain to Cloudflare for DDoS protection and caching
2. **Backup Strategy**: Regular backups of `/var/www/html` and database
3. **Monitoring**: Setup server monitoring (UptimeRobot, Pingdom)
4. **Log Rotation**: Configure logrotate for Apache logs
5. **Fail2Ban**: Install fail2ban to prevent brute force attacks

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 📝 Usage Guide

### For Users:

1. **Sign Up**: Visit digitel.site and create an account
2. **Build Your App**: Build your React/Vue/Angular app (`npm run build`)
3. **Deploy**: 
   - Click "New Deployment"
   - Enter project name
   - Choose a subdomain
   - Upload your build folder (dist/build)
   - Click Deploy
4. **Access**: Your site will be live at `https://yoursubdomain.digitel.site`

### Managing Projects:

- **View Projects**: Dashboard shows all your deployments
- **Delete Project**: Click trash icon to remove a project
- **Update Project**: Delete and redeploy (future: implement updates)

## 🐛 Troubleshooting

### Function Execution Fails:

1. Check function logs in Appwrite Console
2. Verify environment variables are set
3. Ensure server has proper permissions
4. Check Apache error logs: `sudo tail -f /var/log/apache2/error.log`

### SSL Certificate Issues:

```bash
# Renew certificates manually
sudo certbot renew

# Restart Apache
sudo systemctl restart apache2
```

### Site Not Accessible:

1. Check Apache is running: `sudo systemctl status apache2`
2. Check DNS propagation: `nslookup subdomain.digitel.site`
3. Check firewall: `sudo iptables -L -n`
4. Check vhost config: `sudo apache2ctl -S`

### Permission Issues:

```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/html

# Fix permissions
sudo find /var/www/html -type d -exec chmod 755 {} \;
sudo find /var/www/html -type f -exec chmod 644 {} \;
```

## 🚀 Future Enhancements

- [ ] Custom domains (bring your own domain)
- [ ] CI/CD integration with GitHub
- [ ] Deployment history and rollbacks
- [ ] Environment variables for deployed apps
- [ ] Analytics dashboard
- [ ] Team collaboration
- [ ] API for CLI deployments
- [ ] Docker support
- [ ] Edge functions/API routes

## 📄 License

MIT License - feel free to use for personal or commercial projects

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

## 📧 Support

For issues or questions, contact: admin@digitel.site
