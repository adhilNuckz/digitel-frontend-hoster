# Backend Integration - Deployment Checklist

## 📋 Pre-Deployment Checklist

### 1. Appwrite Database Setup
- [ ] Log in to Appwrite Console
- [ ] Navigate to Database → projects collection
- [ ] Add attribute: `hasBackend` (Boolean, not required)
- [ ] Add attribute: `backendUrl` (String, size: 512, not required)
- [ ] Add attribute: `apiPrefix` (String, size: 100, not required)
- [ ] Save and wait for indexing to complete

### 2. Frontend Deployment
- [ ] Review changes in DeploymentForm.jsx
- [ ] Test locally with `npm run dev`
- [ ] Build: `npm run build`
- [ ] Upload `dist/` contents to `/var/www/html/main/` on server
- [ ] Test on https://digitel.site

### 3. Server API Update
- [ ] SSH into Oracle Cloud server
- [ ] Navigate to `~/digitel/server-api`
- [ ] Backup current server.js: `cp server.js server.js.backup`
- [ ] Upload new server.js (from `server-api-updated/server.js`)
- [ ] Restart API: `pm2 restart digitel-api` or `node server.js`
- [ ] Check logs: `pm2 logs digitel-api`

### 4. Apache Configuration
- [ ] Verify proxy modules are enabled:
  ```bash
  sudo a2enmod proxy
  sudo a2enmod proxy_http
  sudo a2enmod headers
  ```
- [ ] Test Apache config: `sudo apache2ctl configtest`
- [ ] Reload Apache: `sudo systemctl reload apache2`

### 5. Testing

#### Test 1: Deploy Without Backend
- [ ] Create new deployment
- [ ] Leave "Enable Backend Integration" unchecked
- [ ] Deploy successfully
- [ ] Verify site loads at subdomain.digitel.site
- [ ] Check Apache config has NO ProxyPass directives

#### Test 2: Deploy With Backend
- [ ] Create new deployment
- [ ] Check "Enable Backend Integration"
- [ ] Enter backend URL: `https://jsonplaceholder.typicode.com`
- [ ] Enter API prefix: `/posts`
- [ ] Deploy successfully
- [ ] Open browser console on deployed site
- [ ] Test fetch: `fetch('/posts').then(r => r.json()).then(console.log)`
- [ ] Verify API response is returned
- [ ] Check Apache config includes ProxyPass directives

#### Test 3: Validation
- [ ] Try deploying with invalid backend URL (should fail)
- [ ] Try deploying with localhost URL (should fail)
- [ ] Try deploying with `/` as API prefix (should fail)

### 6. Documentation
- [ ] Read BACKEND-INTEGRATION-GUIDE.md
- [ ] Update internal documentation if needed
- [ ] Prepare user announcement/tutorial

---

## 🔧 Quick Commands

### SSH to Server
```bash
ssh root@140.238.243.1
```

### Restart API Server
```bash
pm2 restart digitel-api
pm2 logs digitel-api --lines 50
```

### Check Apache Status
```bash
sudo systemctl status apache2
sudo apache2ctl configtest
```

### View Recent Deployments
```bash
ls -lt /var/www/html/ | head -10
```

### View Apache Site Config
```bash
cat /etc/apache2/sites-available/[subdomain].digitel.site.conf
```

---

## 🚨 Rollback Plan (If Something Goes Wrong)

### Rollback Server API
```bash
cd ~/digitel/server-api
cp server.js.backup server.js
pm2 restart digitel-api
```

### Rollback Frontend
```bash
# Re-deploy previous version from git
git checkout [previous-commit]
npm run build
# Upload dist/ to server
```

### Rollback Database
- Remove the three new attributes from Appwrite collection
- Existing projects won't be affected (backward compatible)

---

## ✅ Success Criteria

- [ ] New deployment form shows backend integration option
- [ ] Static deployments work as before (no regression)
- [ ] Backend proxy deployments create correct Apache config
- [ ] API calls are successfully proxied to backend
- [ ] No CORS errors when using backend integration
- [ ] Security validations prevent malicious URLs
- [ ] Error messages are clear and helpful

---

## 📞 Support Info

If issues arise:
1. Check server logs: `pm2 logs digitel-api`
2. Check Apache logs: `tail -f /var/log/apache2/error.log`
3. Verify Appwrite database has new attributes
4. Test with simple backend (jsonplaceholder.typicode.com)
5. Review BACKEND-INTEGRATION-GUIDE.md troubleshooting section

---

## 🎯 Next Steps After Deployment

1. **User Communication**: Announce new feature
2. **Tutorial**: Create video/article showing how to use backend integration
3. **Monitor**: Watch for any error patterns in logs
4. **Iterate**: Gather user feedback and improve UI/UX
5. **Future Features**:
   - Multiple API prefixes support
   - WebSocket proxy support
   - Custom headers configuration
   - Backend health check before deployment
