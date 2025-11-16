# Digitel Server API

Server-side deployment API that runs on your Oracle Cloud server (140.238.243.1).

## Setup Instructions

### 1. Upload to Server

```bash
# From your local machine
scp -r server-api ubuntu@140.238.243.1:/home/ubuntu/
```

### 2. Install Dependencies on Server

```bash
# SSH into server
ssh ubuntu@140.238.243.1

# Navigate to directory
cd ~/server-api

# Install dependencies
npm install
```

### 3. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit with your actual values
nano .env
```

Fill in:
- `API_SECRET`: Generate a random secret (e.g., `openssl rand -hex 32`)
- `APPWRITE_API_KEY`: Your Appwrite API key (same one from function)
- `APPWRITE_COLLECTION_ID`: Your projects collection ID

### 4. Test the API

```bash
# Start the server
npm start

# In another terminal, test health check
curl http://localhost:3001/health
```

### 5. Setup as System Service (Production)

Create systemd service file:

```bash
sudo nano /etc/systemd/system/digitel-api.service
```

Add:

```ini
[Unit]
Description=Digitel Server API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/server-api
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable digitel-api
sudo systemctl start digitel-api
sudo systemctl status digitel-api
```

### 6. Configure Firewall

```bash
# Allow port 3001
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3001 -j ACCEPT
sudo netfilter-persistent save
```

## Update Appwrite Function

Add these environment variables to your Appwrite function:

- `SERVER_API_URL`: `http://140.238.243.1:3001`
- `API_SECRET`: [same secret from server .env]

Then redeploy the function:

```bash
cd appwrite-functions/deploy
appwrite push function
```

## Testing

Deploy a test project through your dashboard and check logs:

```bash
# View API logs
sudo journalctl -u digitel-api -f

# Check Apache logs
sudo tail -f /var/log/apache2/error.log
```

## Troubleshooting

### API not responding
```bash
sudo systemctl status digitel-api
sudo journalctl -u digitel-api -n 50
```

### Permission errors
Make sure sudoers is configured (see DEPLOYMENT-CHECKLIST.md Phase 3.6)

### Apache errors
```bash
sudo apache2ctl configtest
sudo systemctl status apache2
```
