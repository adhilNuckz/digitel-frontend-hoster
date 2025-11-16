import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Client, Databases, Storage } from 'node-appwrite';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

dotenv.config();

const execAsync = promisify(exec);
const app = express();

// Configuration
const PORT = process.env.PORT || 3001;
const API_SECRET = process.env.API_SECRET;
const BASE_DIR = process.env.BASE_DIR || '/var/www/html';
const APACHE_SITES_AVAILABLE = process.env.APACHE_SITES_AVAILABLE || '/etc/apache2/sites-available';
const DOMAIN = process.env.DOMAIN || 'digitel.site';

// Appwrite configuration
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateRequest = (req, res, next) => {
  const secret = req.headers['x-api-secret'];
  
  if (!secret || secret !== API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

/**
 * Validate subdomain name
 */
function validateSubdomain(subdomain) {
  if (!subdomain || typeof subdomain !== 'string') {
    throw new Error('Invalid subdomain');
  }
  
  const cleanSubdomain = subdomain.toLowerCase().trim();
  
  if (!/^[a-z0-9-]+$/.test(cleanSubdomain)) {
    throw new Error('Subdomain can only contain lowercase letters, numbers, and hyphens');
  }
  
  if (cleanSubdomain.length < 3 || cleanSubdomain.length > 63) {
    throw new Error('Subdomain must be between 3 and 63 characters');
  }
  
  const forbidden = ['admin', 'api', 'www', 'mail', 'ftp', 'root', 'test', 'main'];
  if (forbidden.includes(cleanSubdomain)) {
    throw new Error('This subdomain is not allowed');
  }
  
  return cleanSubdomain;
}

/**
 * Download files from Appwrite Storage
 */
async function downloadProjectFiles(fileId) {
  try {
    const result = await storage.getFileDownload(
      process.env.APPWRITE_BUCKET_ID,
      fileId
    );
    
    return result;
  } catch (error) {
    throw new Error(`Failed to download files: ${error.message}`);
  }
}

/**
 * Create Apache virtual host configuration
 */
async function createVirtualHost(subdomain) {
  const serverName = `${subdomain}.${DOMAIN}`;
  const documentRoot = path.join(BASE_DIR, subdomain);
  const configFile = path.join(APACHE_SITES_AVAILABLE, `${serverName}.conf`);
  
  const vhostConfig = `<VirtualHost *:443>
    ServerName ${serverName}
    ServerAdmin admin@${DOMAIN}
    DocumentRoot ${documentRoot}
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/${DOMAIN}-0001/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/${DOMAIN}-0001/privkey.pem
    
    <Directory ${documentRoot}>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        <IfModule mod_rewrite.c>
            RewriteEngine On
            RewriteBase /
            RewriteRule ^index\\.html$ - [L]
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteRule . /index.html [L]
        </IfModule>
    </Directory>
    
    <IfModule mod_headers.c>
        Header always set X-Content-Type-Options "nosniff"
        Header always set X-Frame-Options "SAMEORIGIN"
        Header always set X-XSS-Protection "1; mode=block"
    </IfModule>
    
    ErrorLog \${APACHE_LOG_DIR}/${serverName}-error.log
    CustomLog \${APACHE_LOG_DIR}/${serverName}-access.log combined
</VirtualHost>

<VirtualHost *:80>
    ServerName ${serverName}
    Redirect permanent / https://${serverName}/
</VirtualHost>
`;

  await fs.writeFile(configFile, vhostConfig, { mode: 0o644 });
  return configFile;
}

/**
 * Deploy project endpoint
 */
app.post('/deploy', authenticateRequest, async (req, res) => {
  const { projectId, subdomain, files } = req.body;
  
  if (!projectId || !subdomain || !files) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields: projectId, subdomain, files' 
    });
  }
  
  try {
    console.log(`Starting deployment for ${subdomain}...`);
    console.log(`Received ${files.length} files`);
    
    // Validate subdomain
    const cleanSubdomain = validateSubdomain(subdomain);
    const projectPath = path.join(BASE_DIR, cleanSubdomain);
    
    // Check if already exists
    try {
      await fs.access(projectPath);
      throw new Error('A project with this subdomain already exists');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    
    // Create project directory
    await fs.mkdir(projectPath, { recursive: true, mode: 0o755 });
    console.log(`Created directory: ${projectPath}`);
    
    // Write files to directory
    for (const file of files) {
      const filePath = path.join(projectPath, file.name);
      const fileDir = path.dirname(filePath);
      
      // Create subdirectories if needed
      await fs.mkdir(fileDir, { recursive: true, mode: 0o755 });
      
      // Decode base64 and write file
      const content = Buffer.from(file.content, 'base64');
      await fs.writeFile(filePath, content, { mode: 0o644 });
    }
    console.log(`Files written to ${projectPath}`);
    
    // Verify index.html exists
    const indexPath = path.join(projectPath, 'index.html');
    try {
      await fs.access(indexPath);
    } catch {
      throw new Error('index.html not found in uploaded files');
    }
    
    // Create Apache virtual host
    await createVirtualHost(cleanSubdomain);
    console.log(`Created virtual host for ${cleanSubdomain}`);
    
    // Enable site
    await execAsync(`sudo a2ensite ${cleanSubdomain}.${DOMAIN}.conf`);
    await execAsync('sudo apache2ctl configtest');
    await execAsync('sudo systemctl reload apache2');
    console.log(`Site enabled and Apache reloaded`);
    
    // Set permissions
    await execAsync(`sudo chown -R www-data:www-data ${projectPath}`);
    await execAsync(`sudo find ${projectPath} -type d -exec chmod 755 {} \\;`);
    await execAsync(`sudo find ${projectPath} -type f -exec chmod 644 {} \\;`);
    console.log(`Permissions set`);
    
    // Update project status in Appwrite
    await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_ID,
      projectId,
      {
        status: 'deployed',
        url: `https://${cleanSubdomain}.${DOMAIN}`
      }
    );
    console.log(`Project status updated to deployed`);
    
    res.json({
      success: true,
      message: 'Project deployed successfully',
      url: `https://${cleanSubdomain}.${DOMAIN}`
    });
    
  } catch (error) {
    console.error('Deployment error:', error);
    
    // Try to update status to failed
    try {
      await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_COLLECTION_ID,
        projectId,
        { status: 'failed' }
      );
    } catch (updateError) {
      console.error('Failed to update status:', updateError);
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Delete project endpoint
 */
app.post('/delete', authenticateRequest, async (req, res) => {
  const { subdomain } = req.body;
  
  if (!subdomain) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing subdomain' 
    });
  }
  
  try {
    const cleanSubdomain = validateSubdomain(subdomain);
    const projectPath = path.join(BASE_DIR, cleanSubdomain);
    const serverName = `${cleanSubdomain}.${DOMAIN}`;
    
    // Disable site
    await execAsync(`sudo a2dissite ${serverName}.conf`);
    
    // Remove files
    await execAsync(`sudo rm -rf ${projectPath}`);
    
    // Remove config
    await execAsync(`sudo rm -f ${APACHE_SITES_AVAILABLE}/${serverName}.conf`);
    
    // Reload Apache
    await execAsync('sudo systemctl reload apache2');
    
    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Digitel Server API running on port ${PORT}`);
  console.log(`Domain: ${DOMAIN}`);
  console.log(`Base directory: ${BASE_DIR}`);
});
