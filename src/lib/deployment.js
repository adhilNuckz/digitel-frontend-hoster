import { storage } from './appwrite';

// Use proxy through main domain to avoid CORS and mixed content issues
const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL || 'https://digitel.site/api';
const API_SECRET = import.meta.env.VITE_API_SECRET || 'standard_342fdd4d37a888c378d742970b11879f2d7961538d971828896ef8a52395447611eb3eb54a2cad849a015590198a6bcd6b19228cfd6a47f74d063931e498820464dcd8099724b86fd20f14d709cf4fce9214fdeb538bbc925341b87747889bdf57e36733eca27fc70e790826a6f8b45f02221fb5475688158bdb70f0747fb7ed';
const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;

export const deploymentService = {
  // Deploy a project to the server
  async deployProject(projectData) {
    try {
      const { projectId, subdomain, files } = projectData;
      
      // Skip storage upload for now - send files directly to server
      console.log('Calling server API directly with files...');
      const response = await fetch(`${SERVER_API_URL}/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Secret': API_SECRET
        },
        body: JSON.stringify({
          projectId,
          subdomain,
          files: files // Send files array directly
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(errorData.error || 'Server deployment failed');
      }
      
      const result = await response.json();
      return { success: true, data: result };
      
    } catch (error) {
      console.error('Deployment error:', error);
      throw error;
    }
  },

  // Delete a deployed project
  async deleteDeployment(subdomain) {
    try {
      const response = await fetch(`${SERVER_API_URL}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Secret': API_SECRET
        },
        body: JSON.stringify({ subdomain })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete deployment');
      }
      
      const result = await response.json();
      return { success: true, data: result };
      
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }
};
