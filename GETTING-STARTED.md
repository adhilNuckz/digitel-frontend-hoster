# Getting Started - First Steps

Welcome! Here's exactly what to do to get your Digitel platform running.

## Step 1: Install Dependencies (2 minutes)

Open PowerShell in this project folder and run:

```powershell
npm install
```

This will install all required packages for the React frontend.

## Step 2: Create Your Appwrite Project (10 minutes)

1. Go to [cloud.appwrite.io](https://cloud.appwrite.io)
2. Sign up or log in
3. Click "Create Project"
4. Name it "Digitel"
5. Copy your Project ID

### Setup Authentication

1. In your project, go to **Auth** → **Settings**
2. Enable **Email/Password**
3. (Optional) Enable **GitHub OAuth**:
   - Go to GitHub Settings → Developer Settings → OAuth Apps
   - Create New OAuth App
   - Homepage URL: `https://digitel.site`
   - Callback URL: Use the one shown in Appwrite
   - Copy Client ID and Secret to Appwrite

### Create Database

1. Go to **Databases** → Create Database
2. Name: `production`
3. Copy Database ID
4. Create Collection: `projects`
5. Copy Collection ID
6. Add these attributes:

| Key | Type | Size | Required | Default |
|-----|------|------|----------|---------|
| userId | String | 255 | Yes | - |
| projectName | String | 255 | Yes | - |
| subdomain | String | 63 | Yes | - |
| status | String | 50 | Yes | pending |
| url | String | 255 | No | - |
| createdAt | String | 50 | Yes | - |

7. Create Indexes:
   - Index 1: Key `userId_index`, Type: key, Attribute: userId
   - Index 2: Key `subdomain_unique`, Type: unique, Attribute: subdomain

8. Set Permissions for ALL operations (read/create/update/delete):
   - Click each permission type
   - Select "Any authenticated user"
   - Or add: `user:*`

### Create Storage Bucket

1. Go to **Storage** → Create Bucket
2. Name: `project-files`
3. Copy Bucket ID
4. Max file size: `52428800` (50MB)
5. File extensions: Leave empty (allow all)
6. Set Permissions (all to `user:*`)

## Step 3: Configure Environment Variables (2 minutes)

1. Copy `.env.example` to `.env`:

```powershell
copy .env.example .env
```

2. Open `.env` in VS Code
3. Fill in all the IDs you copied:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=paste_your_project_id
VITE_APPWRITE_DATABASE_ID=paste_your_database_id
VITE_APPWRITE_PROJECTS_COLLECTION_ID=paste_your_collection_id
VITE_APPWRITE_BUCKET_ID=paste_your_bucket_id
VITE_APPWRITE_DEPLOY_FUNCTION_ID=leave_empty_for_now
VITE_APP_DOMAIN=digitel.site
```

## Step 4: Test Locally (2 minutes)

```powershell
npm run dev
```

Open your browser to: http://localhost:3000

### Test These Features:

1. ✅ Landing page loads
2. ✅ Click "Get Started" → goes to login page
3. ✅ Try to sign up with email/password
4. ✅ Login with the account you created
5. ✅ Dashboard loads (will be empty)

**Don't try to deploy yet** - that requires the server and function setup!

## Step 5: Setup Your Server (30 minutes)

Now you need to configure your Oracle Cloud server at `140.238.243.1`.

### Quick Setup

1. Open PowerShell and copy the setup script to your server:

```powershell
scp server-setup.sh ubuntu@140.238.243.1:~/
```

2. SSH into your server:

```powershell
ssh ubuntu@140.238.243.1
```

3. Run the setup script:

```bash
chmod +x server-setup.sh
sudo ./server-setup.sh
```

This will install Apache, Node.js, and configure everything.

### Configure SSL

After the script completes:

```bash
# Get SSL for main domain
sudo certbot --apache -d digitel.site -d www.digitel.site

# Get wildcard SSL for subdomains
sudo certbot certonly --manual --preferred-challenges dns -d digitel.site -d *.digitel.site
```

For wildcard cert, you'll need to add TXT records to your DNS. The certbot will tell you exactly what to add.

### Configure SSL Virtual Host

```bash
sudo nano /etc/apache2/sites-available/digitel.site-ssl.conf
```

Copy this content (see SERVER-SETUP.md for full config):

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
</VirtualHost>

<VirtualHost *:443>
    ServerName *.digitel.site
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/digitel.site/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/digitel.site/privkey.pem
    
    VirtualDocumentRoot /var/www/html/%1
    
    <Directory /var/www/html/*>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

Enable it:

```bash
sudo a2ensite digitel.site-ssl.conf
sudo systemctl reload apache2
```

## Step 6: Deploy Appwrite Function (15 minutes)

### Create Function in Appwrite Console

1. Go to **Functions** → Create Function
2. Name: `Deploy Function`
3. Runtime: `Node.js 18.0`
4. Entry point: `src/main.js`
5. Execute access: Add `user:*`
6. Copy the Function ID

### Add Environment Variables

In the function settings, add:

```
APPWRITE_API_KEY=your_api_key_here
```

To get API key:
- Go to Project Settings → API Keys
- Create new key with scopes: documents.read, documents.write
- Copy the key

### Deploy the Function

Option 1 - Manual Upload:
1. Zip the `appwrite-functions/deploy` folder
2. Upload via Appwrite Console
3. Wait for build to complete

Option 2 - CLI:
```powershell
npm install -g appwrite-cli
appwrite login
cd appwrite-functions/deploy
appwrite deploy function
```

### Update .env with Function ID

Add the function ID to your `.env` file:

```env
VITE_APPWRITE_DEPLOY_FUNCTION_ID=your_function_id_here
```

Restart your dev server:

```powershell
# Ctrl+C to stop
npm run dev
```

### Configure Server Permissions

On your server, allow the function to run Apache commands:

```bash
sudo visudo -f /etc/sudoers.d/appwrite-function
```

Add this line (adjust username if needed):

```
ubuntu ALL=(ALL) NOPASSWD: /usr/sbin/a2ensite, /usr/sbin/a2dissite, /usr/sbin/apache2ctl, /bin/systemctl reload apache2, /bin/chown, /bin/chmod, /usr/bin/find
```

Save and exit.

## Step 7: Test Full Deployment (5 minutes)

### Create a Test Site

On your local machine:

```powershell
# Create a simple test site
mkdir test-deployment
cd test-deployment
echo "<h1>Hello from Digitel!</h1><p>This is my first deployment!</p>" > index.html
cd ..
```

### Deploy It

1. Go to http://localhost:3000
2. Login to your account
3. Click "New Deployment"
4. Fill in:
   - Project Name: `My First Site`
   - Subdomain: `test` (or any name you like)
5. Click the folder upload area
6. Select the `test-deployment` folder
7. Click "Deploy"
8. Wait ~30 seconds

### Visit Your Site

Your site should now be live at:
- http://test.digitel.site (if SSL not configured yet)
- https://test.digitel.site (with SSL)

## Step 8: Deploy Frontend to Production (10 minutes)

### Build the React App

```powershell
npm run build
```

### Upload to Server

```powershell
scp -r dist ubuntu@140.238.243.1:/tmp/digitel-app
```

### Move Files on Server

```bash
ssh ubuntu@140.238.243.1
sudo rm -rf /var/www/html/main/*
sudo mv /tmp/digitel-app/* /var/www/html/main/
sudo chown -R www-data:www-data /var/www/html/main
sudo chmod -R 755 /var/www/html/main
```

### Test Production Site

Visit: https://digitel.site

You should see your landing page!

## 🎉 Success!

You now have:
- ✅ A working local development environment
- ✅ Appwrite backend configured
- ✅ Server with Apache and SSL
- ✅ Deployment function working
- ✅ Production site live

## Next Steps

1. **Customize**: Edit the landing page, colors, text
2. **Test**: Deploy different types of sites (React, Vue, etc.)
3. **Monitor**: Watch Apache logs for any issues
4. **Share**: Let others test your platform!

## Troubleshooting

### "Cannot connect to Appwrite"
- Check your Project ID in `.env`
- Verify internet connection
- Check Appwrite service status

### "Deployment failed"
- Check Appwrite function logs in console
- Verify server permissions (sudoers file)
- Check Apache error logs on server

### "Site not accessible"
- Wait for DNS propagation (24-48 hours)
- Check Apache is running: `sudo systemctl status apache2`
- Verify virtual host config: `sudo apache2ctl -S`

### "SSL certificate error"
- Make sure you added DNS TXT records
- Run: `sudo certbot certificates` to check status
- Renew if needed: `sudo certbot renew`

## Need Help?

Check these files:
- `README.md` - Complete documentation
- `QUICKSTART.md` - Quick reference
- `DEPLOYMENT-CHECKLIST.md` - Detailed checklist
- `API.md` - API documentation

## 🚀 You're Ready!

You've built a complete hosting platform from scratch. Now go deploy some amazing sites!

**Happy Deploying!** ✨
