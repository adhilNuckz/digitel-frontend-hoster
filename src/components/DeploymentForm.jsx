import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { databaseService } from '../lib/database';
import { deploymentService } from '../lib/deployment';
import { Upload, Check, AlertCircle, Loader } from 'lucide-react';
import Button from './Button';
import Input from './Input';

export default function DeploymentForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    projectName: '',
    subdomain: '',
    hasBackend: false,
    backendUrl: '',
    apiPrefix: '/api'
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deployStatus, setDeployStatus] = useState('');
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
      setErrors(prev => ({ ...prev, [name]: '' }));
      return;
    }
    
    // Clean subdomain input
    if (name === 'subdomain') {
      const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFolderSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setErrors(prev => ({ ...prev, files: '' }));
  };

  const validateForm = async () => {
    const newErrors = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }

    if (!formData.subdomain.trim()) {
      newErrors.subdomain = 'Subdomain is required';
    } else if (formData.subdomain.length < 3) {
      newErrors.subdomain = 'Subdomain must be at least 3 characters';
    } else if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
      newErrors.subdomain = 'Only lowercase letters, numbers, and hyphens allowed';
    } else {
      // Check if subdomain exists
      const exists = await databaseService.checkSubdomainExists(formData.subdomain);
      if (exists) {
        newErrors.subdomain = 'This subdomain is already taken';
      }
    }

    if (files.length === 0) {
      newErrors.files = 'Please select files to upload';
    }

    // Validate backend fields if enabled
    if (formData.hasBackend) {
      if (!formData.backendUrl.trim()) {
        newErrors.backendUrl = 'Backend URL is required';
      } else {
        try {
          const url = new URL(formData.backendUrl);
          if (url.protocol !== 'https:' && url.protocol !== 'http:') {
            newErrors.backendUrl = 'URL must use http:// or https://';
          }
        } catch {
          newErrors.backendUrl = 'Invalid URL format';
        }
      }

      if (!formData.apiPrefix.trim()) {
        newErrors.apiPrefix = 'API prefix is required';
      } else if (!formData.apiPrefix.startsWith('/')) {
        newErrors.apiPrefix = 'API prefix must start with /';
      } else if (formData.apiPrefix === '/') {
        newErrors.apiPrefix = 'Cannot proxy all requests (use specific path like /api)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) return;

    setUploading(true);
    setUploadProgress(0);
    setDeployStatus('Preparing files...');

    try {
      // Step 1: Create project record in database
      setDeployStatus('Creating project record...');
      const project = await databaseService.createProject(user.$id, {
        projectName: formData.projectName,
        subdomain: formData.subdomain,
        status: 'pending',
        hasBackend: formData.hasBackend,
        backendUrl: formData.hasBackend ? formData.backendUrl : null,
        apiPrefix: formData.hasBackend ? formData.apiPrefix : null
      });

      setUploadProgress(20);

      // Step 2: Prepare file data for deployment
      setDeployStatus('Uploading files...');
      
      // Convert files to base64 for transfer
      const filePromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            // Get relative path from webkitRelativePath
            const relativePath = file.webkitRelativePath || file.name;
            // Remove the first folder name (usually "dist" or "build")
            const pathParts = relativePath.split('/');
            const cleanPath = pathParts.length > 1 ? pathParts.slice(1).join('/') : pathParts[0];
            
            resolve({
              name: cleanPath,
              content: reader.result.split(',')[1], // Get base64 content
              type: file.type
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const filesData = await Promise.all(filePromises);
      setUploadProgress(50);

      // Step 3: Deploy to server via Appwrite Function
      setDeployStatus('Deploying to server...');
      const deployResult = await deploymentService.deployProject({
        projectId: project.$id,
        subdomain: formData.subdomain,
        files: filesData,
        hasBackend: formData.hasBackend,
        backendUrl: formData.hasBackend ? formData.backendUrl : null,
        apiPrefix: formData.hasBackend ? formData.apiPrefix : null
      });

      if (!deployResult.success) {
        throw new Error(deployResult.error || 'Deployment failed');
      }

      setUploadProgress(80);

      // Step 4: Update project status
      setDeployStatus('Finalizing...');
      await databaseService.updateProjectStatus(
        project.$id,
        'active',
        `https://${formData.subdomain}.digitel.site`
      );

      setUploadProgress(100);
      setDeployStatus('Deployment successful!');

      // Wait a moment to show success message
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('Deployment error:', error);
      setDeployStatus('');
      setErrors({ 
        submit: error.message || 'Failed to deploy. Please try again.' 
      });
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Project Name"
        name="projectName"
        value={formData.projectName}
        onChange={handleChange}
        placeholder="My Awesome Site"
        required
        error={errors.projectName}
        disabled={uploading}
      />

      <Input
        label="Subdomain"
        name="subdomain"
        value={formData.subdomain}
        onChange={handleChange}
        placeholder="my-site"
        required
        error={errors.subdomain}
        helperText="Your site will be available at subdomain.digitel.site"
        disabled={uploading}
      />

      {/* Backend Integration Section */}
      <div className="border border-gray-200 dark:border-neon-500/30 rounded-lg p-4 bg-gray-50 dark:bg-dark-300">
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="hasBackend"
            name="hasBackend"
            checked={formData.hasBackend}
            onChange={handleChange}
            disabled={uploading}
            className="h-4 w-4 text-neon-500 focus:ring-neon-500 border-gray-300 rounded"
          />
          <label htmlFor="hasBackend" className="ml-2 block text-sm font-bold text-gray-700 dark:text-neon-500">
            Enable Backend Integration (Optional)
          </label>
        </div>
        
        {formData.hasBackend && (
          <div className="space-y-3 mt-3 pl-6 border-l-2 border-neon-500/30">
            <Input
              label="Backend URL"
              name="backendUrl"
              value={formData.backendUrl}
              onChange={handleChange}
              placeholder="https://api.example.com"
              required={formData.hasBackend}
              error={errors.backendUrl}
              helperText="The URL where your backend API is hosted"
              disabled={uploading}
            />
            
            <Input
              label="API Path Prefix"
              name="apiPrefix"
              value={formData.apiPrefix}
              onChange={handleChange}
              placeholder="/api"
              required={formData.hasBackend}
              error={errors.apiPrefix}
              helperText="Requests to this path will be proxied to your backend (e.g., /api, /graphql)"
              disabled={uploading}
            />
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded p-3 text-xs text-blue-700 dark:text-blue-400">
              <strong>Example:</strong> If you set API prefix to <code className="bg-blue-100 dark:bg-blue-800/50 px-1 rounded">/api</code>, 
              then <code className="bg-blue-100 dark:bg-blue-800/50 px-1 rounded">yoursite.digitel.site/api/users</code> will proxy to 
              <code className="bg-blue-100 dark:bg-blue-800/50 px-1 rounded">{formData.backendUrl || 'your-backend'}/api/users</code>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-neon-500 mb-2">
          Upload Build Folder <span className="text-red-500">*</span>
        </label>
        
        <div
          onClick={() => folderInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${errors.files ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-primary-500 bg-gray-50'}
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            ref={folderInputRef}
            type="file"
            /* @ts-ignore */
            webkitdirectory=""
            directory=""
            multiple
            onChange={handleFolderSelect}
            className="hidden"
            disabled={uploading}
          />
          
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            Click to select your build folder (dist/build)
          </p>
          {files.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              <Check className="h-4 w-4 inline mr-1" />
              {files.length} files selected
            </p>
          )}
        </div>
        
        {errors.files && (
          <p className="mt-1 text-sm text-red-600">{errors.files}</p>
        )}
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{errors.submit}</p>
        </div>
      )}

      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Loader className="h-5 w-5 text-blue-500 mr-2 animate-spin" />
            <p className="text-sm text-blue-700 font-medium">{deployStatus}</p>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-blue-600 mt-1 text-right">{uploadProgress}%</p>
        </div>
      )}

      <div className="flex space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={uploading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={uploading}
          loading={uploading}
          className="flex-1"
        >
          Deploy
        </Button>
      </div>
    </form>
  );
}
