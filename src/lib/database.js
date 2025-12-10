import { databases } from './appwrite';
import { ID, Query } from 'appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const PROJECTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PROJECTS_COLLECTION_ID;

export const databaseService = {
  // Create a new project record
  async createProject(userId, projectData) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        ID.unique(),
        {
          userId,
          subdomain: projectData.subdomain,
          projectName: projectData.projectName,
          status: 'pending',
          createdAt: new Date().toISOString(),
          hasBackend: projectData.hasBackend || false,
          backendUrl: projectData.backendUrl || null,
          apiPrefix: projectData.apiPrefix || null,
          ...projectData
        }
      );
    } catch (error) {
      throw error;
    }
  },

  // Get all projects for a user
  async getUserProjects(userId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.orderDesc('createdAt')
        ]
      );
      return response.documents;
    } catch (error) {
      throw error;
    }
  },

  // Get a single project
  async getProject(projectId) {
    try {
      return await databases.getDocument(
        DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        projectId
      );
    } catch (error) {
      throw error;
    }
  },

  // Update project status
  async updateProjectStatus(projectId, status, url = null) {
    try {
      const updateData = { status };
      if (url) {
        updateData.url = url;
      }
      return await databases.updateDocument(
        DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        projectId,
        updateData
      );
    } catch (error) {
      throw error;
    }
  },

  // Delete a project
  async deleteProject(projectId) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        projectId
      );
    } catch (error) {
      throw error;
    }
  },

  // Check if subdomain exists
  async checkSubdomainExists(subdomain) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        [Query.equal('subdomain', subdomain)]
      );
      return response.documents.length > 0;
    } catch (error) {
      throw error;
    }
  }
};
