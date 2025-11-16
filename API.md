# API Reference

## Appwrite Services

### Authentication Service (`src/lib/auth.js`)

#### `authService.createAccount(email, password, name)`

Create a new user account.

**Parameters:**
- `email` (string): User's email address
- `password` (string): Password (min 8 characters)
- `name` (string): User's full name

**Returns:** User account object

**Example:**
```javascript
const user = await authService.createAccount(
  'user@example.com',
  'password123',
  'John Doe'
);
```

#### `authService.login(email, password)`

Login with email and password.

**Parameters:**
- `email` (string): User's email
- `password` (string): Password

**Returns:** Session object

#### `authService.loginWithGitHub()`

Initiate GitHub OAuth login.

**Note:** Redirects to GitHub for authentication.

#### `authService.getCurrentUser()`

Get currently authenticated user.

**Returns:** User object or null

#### `authService.logout()`

Logout current user.

#### `authService.isLoggedIn()`

Check if user is authenticated.

**Returns:** boolean

---

### Database Service (`src/lib/database.js`)

#### `databaseService.createProject(userId, projectData)`

Create a new project record in database.

**Parameters:**
- `userId` (string): Owner's user ID
- `projectData` (object):
  - `projectName` (string): Display name
  - `subdomain` (string): Subdomain identifier
  - Additional fields as needed

**Returns:** Project document

**Example:**
```javascript
const project = await databaseService.createProject(user.$id, {
  projectName: 'My Portfolio',
  subdomain: 'portfolio'
});
```

#### `databaseService.getUserProjects(userId)`

Get all projects for a user.

**Parameters:**
- `userId` (string): User's ID

**Returns:** Array of project documents

#### `databaseService.getProject(projectId)`

Get a single project by ID.

**Parameters:**
- `projectId` (string): Project document ID

**Returns:** Project document

#### `databaseService.updateProjectStatus(projectId, status, url)`

Update project deployment status.

**Parameters:**
- `projectId` (string): Project ID
- `status` (string): Status ('pending', 'deploying', 'active', 'failed')
- `url` (string, optional): Deployed URL

**Returns:** Updated project document

#### `databaseService.deleteProject(projectId)`

Delete a project record.

**Parameters:**
- `projectId` (string): Project ID

#### `databaseService.checkSubdomainExists(subdomain)`

Check if subdomain is already taken.

**Parameters:**
- `subdomain` (string): Subdomain to check

**Returns:** boolean

---

### Storage Service (`src/lib/storage.js`)

#### `storageService.uploadFile(file, onProgress)`

Upload a single file to Appwrite storage.

**Parameters:**
- `file` (File): File object to upload
- `onProgress` (function, optional): Progress callback

**Returns:** File document

#### `storageService.uploadFiles(files, onProgress)`

Upload multiple files.

**Parameters:**
- `files` (Array<File>): Array of files
- `onProgress` (function, optional): Progress callback

**Returns:** Array of file documents

#### `storageService.getFilePreview(fileId)`

Get file preview URL.

**Parameters:**
- `fileId` (string): File document ID

**Returns:** URL string

#### `storageService.getFileDownload(fileId)`

Get file download URL.

**Parameters:**
- `fileId` (string): File document ID

**Returns:** URL string

#### `storageService.deleteFile(fileId)`

Delete a file from storage.

**Parameters:**
- `fileId` (string): File document ID

---

### Deployment Service (`src/lib/deployment.js`)

#### `deploymentService.deployProject(projectData)`

Deploy a project to the server via Appwrite Function.

**Parameters:**
- `projectData` (object):
  - `projectId` (string): Project document ID
  - `subdomain` (string): Subdomain name
  - `files` (Array): Array of file objects with:
    - `name` (string): Relative file path
    - `content` (string): Base64 encoded content
    - `type` (string): MIME type

**Returns:** Deployment result object

**Example:**
```javascript
const result = await deploymentService.deployProject({
  projectId: 'project123',
  subdomain: 'mysite',
  files: [
    {
      name: 'index.html',
      content: 'base64_encoded_content',
      type: 'text/html'
    }
  ]
});
```

#### `deploymentService.deleteDeployment(subdomain)`

Delete a deployed project from server.

**Parameters:**
- `subdomain` (string): Subdomain to remove

**Returns:** Deletion result object

---

## Appwrite Function API

### POST /deploy

Deploy a new frontend project.

**Request Body:**
```json
{
  "projectId": "project_document_id",
  "subdomain": "mysite",
  "files": [
    {
      "name": "index.html",
      "content": "base64_encoded_html_content"
    },
    {
      "name": "css/style.css",
      "content": "base64_encoded_css_content"
    }
  ]
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Project deployed successfully",
  "url": "http://mysite.digitel.site",
  "subdomain": "mysite"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message"
}
```

### POST /delete

Delete a deployed project.

**Request Body:**
```json
{
  "subdomain": "mysite"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## React Hooks

### useAuth

Access authentication context.

**Returns:**
- `user` (object): Current user or null
- `login` (function): Login with email/password
- `signup` (function): Create new account
- `loginWithGitHub` (function): Login with GitHub
- `logout` (function): Logout current user
- `loading` (boolean): Loading state

**Example:**
```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
  
  if (user) {
    return <button onClick={logout}>Logout</button>;
  }
  
  return <button onClick={() => login('email', 'pass')}>Login</button>;
}
```

---

## Components API

### Button

Reusable button component.

**Props:**
- `children` (node): Button content
- `variant` (string): 'primary' | 'secondary' | 'danger' | 'outline'
- `size` (string): 'sm' | 'md' | 'lg'
- `disabled` (boolean): Disable button
- `loading` (boolean): Show loading state
- `onClick` (function): Click handler
- `type` (string): Button type
- `className` (string): Additional classes

### Input

Form input component.

**Props:**
- `label` (string): Input label
- `type` (string): Input type
- `name` (string): Input name
- `value` (any): Input value
- `onChange` (function): Change handler
- `placeholder` (string): Placeholder text
- `required` (boolean): Required field
- `disabled` (boolean): Disabled state
- `error` (string): Error message
- `helperText` (string): Helper text
- `className` (string): Additional classes

### Modal

Modal dialog component.

**Props:**
- `isOpen` (boolean): Open state
- `onClose` (function): Close handler
- `title` (string): Modal title
- `children` (node): Modal content

### DeploymentForm

Complete deployment form component.

**Props:**
- `onSuccess` (function): Success callback
- `onCancel` (function): Cancel callback

---

## Environment Variables

### Frontend (.env)

```env
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_PROJECTS_COLLECTION_ID=your_collection_id
VITE_APPWRITE_BUCKET_ID=your_bucket_id
VITE_APPWRITE_DEPLOY_FUNCTION_ID=your_function_id

# Application Domain
VITE_APP_DOMAIN=digitel.site
```

### Appwrite Function

Set in Appwrite Console:

```env
APPWRITE_FUNCTION_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_FUNCTION_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
```

---

## Error Handling

All services throw errors that should be caught:

```javascript
try {
  await authService.login(email, password);
} catch (error) {
  console.error('Login failed:', error.message);
  // Handle error (show toast, alert, etc.)
}
```

Common error scenarios:
- Invalid credentials
- Network errors
- Permission denied
- Subdomain already taken
- File upload failed
- Deployment timeout

---

## Database Schema

### Projects Collection

```json
{
  "userId": "string (required)",
  "projectName": "string (required)",
  "subdomain": "string (required, unique)",
  "status": "string (required, default: 'pending')",
  "url": "string (optional)",
  "createdAt": "string (required, ISO 8601)"
}
```

**Indexes:**
- `userId` (key)
- `subdomain` (unique)

**Permissions:**
- Read: `user:*`
- Create: `user:*`
- Update: `user:*`
- Delete: `user:*`

---

## File Structure Requirements

For successful deployment, uploaded folders must:

1. Contain an `index.html` file in the root
2. Use relative paths for assets (CSS, JS, images)
3. Be the build output folder (not source code)
4. Not exceed 50MB total size
5. Not contain server-side code

Valid structures:

```
dist/
├── index.html
├── assets/
│   ├── index.css
│   └── index.js
└── images/
    └── logo.png
```

```
build/
├── index.html
├── static/
│   ├── css/
│   └── js/
└── favicon.ico
```
