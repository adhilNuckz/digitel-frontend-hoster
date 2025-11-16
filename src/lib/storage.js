import { storage } from './appwrite';
import { ID } from 'appwrite';

const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;

export const storageService = {
  // Upload a single file
  async uploadFile(file, onProgress) {
    try {
      return await storage.createFile(
        BUCKET_ID,
        ID.unique(),
        file,
        undefined,
        onProgress
      );
    } catch (error) {
      throw error;
    }
  },

  // Upload multiple files
  async uploadFiles(files, onProgress) {
    try {
      const uploadPromises = files.map((file, index) => 
        this.uploadFile(file, (progress) => {
          if (onProgress) {
            onProgress(index, progress);
          }
        })
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw error;
    }
  },

  // Get file preview URL
  getFilePreview(fileId) {
    return storage.getFilePreview(BUCKET_ID, fileId);
  },

  // Get file download URL
  getFileDownload(fileId) {
    return storage.getFileDownload(BUCKET_ID, fileId);
  },

  // Delete a file
  async deleteFile(fileId) {
    try {
      await storage.deleteFile(BUCKET_ID, fileId);
    } catch (error) {
      throw error;
    }
  }
};
