# Backend Integration Feature - Implementation Guide

## 🎯 Overview

This update adds **Backend Proxy Integration** support to Digitel, allowing users to connect their deployed frontend to any backend API. Apache will proxy API requests from the frontend's subdomain to the user's backend URL, avoiding CORS issues.

---

## 📦 What Changed

### 1. Frontend Changes

#### **DeploymentForm.jsx**
- ✅ Added checkbox: "Enable Backend Integration (Optional)"
- ✅ Added fields: Backend URL and API Path Prefix
- ✅ Fields collapse/expand based on checkbox state
- ✅ Validation for URL format and API prefix
- ✅ Helpful example showing how proxy works
- ✅ Sends backend config to deployment API

#### **deployment.js**
- ✅ Updated `deployProject()` to accept `hasBackend`, `backendUrl`, `apiPrefix`
- ✅ Sends backend configuration to server API

#### **database.js**
- ✅ Updated `createProject()` to store backend fields in Appwrite

---

### 2. Backend Changes (server.js)

#### **New Validation Functions**
```javascript
validateBackendUrl(url)      // Validates URL format, prevents local IPs
validateApiPrefix(prefix)    // Validates API prefix format
```

#### **Updated createVirtualHost()**
Now accepts backend parameters and generates Apache config with ProxyPass:

**Without Backend (Static Only):**
```apache
<VirtualHost *:443>
    ServerName myapp.digitel.site
    DocumentRoot /var/www/html/myapp
    # Just serves static files
</VirtualHost>
```

**With Backend (Proxy Enabled):**
```apache
<VirtualHost *:443>
    ServerName myapp.digitel.site
    DocumentRoot /var/www/html/myapp
    
    # Proxy API requests to backend
    ProxyPreserveHost On
    ProxyPass /api https://backend.example.com/api
    ProxyPassReverse /api https://backend.example.com/api
    ProxyTimeout 300
    
    <Directory /var/www/html/myapp>
        # SPA routing with API exclusion
        RewriteCond %{REQUEST_URI} !^/api
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

#### **Security Features**
- ❌ Blocks localhost/127.0.0.1
- ❌ Blocks private IPs (192.168.x.x, 10.x.x.x, 172.x.x.x)
- ✅ Only allows http:// and https://
- ✅ Validates API prefix format

---

### 3. Database Schema Changes

Add these attributes to your Appwrite `projects` collection:

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `hasBackend` | Boolean | No | `false` | Enable backend integration |
| `backendUrl` | String | No | `null` | Backend API URL (e.g., `https://api.example.com`) |
| `apiPrefix` | String | No | `null` | Path prefix for proxy (e.g., `/api`) |

---

## 🚀 Deployment Steps

### Step 1: Update Appwrite Database

1. Go to **Appwrite Console** → Your Project → Databases
2. Open the `projects` collection
3. Add these new attributes:
   - `hasBackend` (Boolean, not required, default: false)
   - `backendUrl` (String, not required, max: 512)
   - `apiPrefix` (String, not required, max: 100)

### Step 2: Deploy Frontend Changes

```bash
cd "C:\Users\Death\Desktop\projects\FrontEnd Hoster"
npm run build
```

Upload `dist/` folder to `/var/www/html/main/` on your server.

### Step 3: Update Server API

On your Oracle Cloud server:

```bash
# Backup old server.js
cd ~/digitel/server-api
cp server.js server.js.backup

# Upload the new server.js from the local file:
# server-api-updated/server.js
```

Then restart the server:

```bash
pm2 restart digitel-api
# or if not using pm2:
# node server.js
```

### Step 4: Verify Apache Modules

Make sure these Apache modules are enabled:

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo systemctl restart apache2
```

---

## 🎨 User Experience

### Deployment Flow (Without Backend)
```
1. User enters project name and subdomain
2. User uploads build folder
3. Click "Deploy"
4. Site goes live at subdomain.digitel.site
```

### Deployment Flow (With Backend)
```
1. User enters project name and subdomain
2. User uploads build folder
3. User checks "Enable Backend Integration"
4. User enters backend URL: https://myapi.com
5. User enters API prefix: /api
6. Click "Deploy"
7. Site goes live with backend proxy configured
```

### Example Usage

**User's Setup:**
- Frontend: React app at `myapp.digitel.site`
- Backend: Node.js API at `https://backend.myapp.com`
- API Prefix: `/api`

**How It Works:**
- `https://myapp.digitel.site/` → Serves static files
- `https://myapp.digitel.site/api/users` → Proxies to `https://backend.myapp.com/api/users`
- `https://myapp.digitel.site/api/posts` → Proxies to `https://backend.myapp.com/api/posts`

**Benefits:**
- ✅ No CORS issues (same domain)
- ✅ Backend can be hosted anywhere
- ✅ SSL works for both frontend and API calls
- ✅ Simple configuration for users

---

## 🔒 Security Considerations

### What's Protected:
1. **No Local IPs**: Prevents proxying to localhost/127.0.0.1
2. **No Private Networks**: Blocks 192.168.x.x, 10.x.x.x, 172.x.x.x
3. **Protocol Validation**: Only http:// and https:// allowed
4. **Path Validation**: API prefix must be specific (not `/`)

### What Users Need to Handle:
1. **Backend CORS**: User's backend must allow requests from `*.digitel.site`
2. **Backend SSL**: Recommended to use HTTPS backend URLs
3. **API Authentication**: User handles their own API auth (JWT, API keys, etc.)

---

## 🧪 Testing

### Test Static-Only Deployment
1. Deploy without checking "Enable Backend Integration"
2. Verify site loads correctly
3. Check Apache config has no ProxyPass directives

### Test Backend Integration
1. Deploy with backend integration enabled
2. Enter test backend URL (e.g., https://jsonplaceholder.typicode.com)
3. Set API prefix to `/api`
4. Check generated Apache config includes ProxyPass
5. Test API call from browser console:
```javascript
fetch('https://yoursite.digitel.site/api/posts')
  .then(r => r.json())
  .then(console.log)
```

---

## 📝 Example Apache Configs

### Static Site (No Backend)
```apache
<VirtualHost *:443>
    ServerName test.digitel.site
    DocumentRoot /var/www/html/test
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/digitel.site-0001/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/digitel.site-0001/privkey.pem
    
    <Directory /var/www/html/test>
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

### With Backend Proxy
```apache
<VirtualHost *:443>
    ServerName app.digitel.site
    DocumentRoot /var/www/html/app
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/digitel.site-0001/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/digitel.site-0001/privkey.pem
    
    # Backend Proxy
    ProxyPreserveHost On
    ProxyPass /api https://backend.example.com/api
    ProxyPassReverse /api https://backend.example.com/api
    ProxyTimeout 300
    
    <Directory /var/www/html/app>
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_URI} !^/api  # Don't rewrite API calls
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

---

## 🐛 Troubleshooting

### Issue: "Cannot proxy to local/private IP addresses"
**Cause:** User tried to use localhost or private IP
**Solution:** User must deploy their backend to a public URL first

### Issue: API requests return 404
**Cause:** API prefix mismatch
**Solution:** Ensure backend actually has the API at that prefix path

### Issue: CORS errors still appear
**Cause:** Backend doesn't allow `*.digitel.site` origin
**Solution:** User needs to configure CORS on their backend:
```javascript
// Node.js Express example
app.use(cors({
  origin: ['https://myapp.digitel.site', 'https://*.digitel.site']
}));
```

### Issue: Proxy timeout
**Cause:** Backend is slow or unresponsive
**Solution:** Increase `ProxyTimeout` in Apache config (currently 300 seconds)

---

## 🎉 Summary

✅ **Frontend:** Added optional backend integration UI
✅ **Database:** New fields for backend configuration
✅ **Server API:** Validates and generates Apache configs with ProxyPass
✅ **Security:** Prevents malicious proxy configurations
✅ **User Experience:** Simple checkbox and two fields to connect backend

Users can now deploy full-stack applications on Digitel! 🚀
