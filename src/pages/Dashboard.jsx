import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { databaseService } from '../lib/database';
import { Plus, Globe, Trash2, ExternalLink, Clock } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import DeploymentForm from '../components/DeploymentForm';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deletingProject, setDeletingProject] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const userProjects = await databaseService.getUserProjects(user.$id);
      setProjects(userProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProject(projectId, subdomain) {
    if (!confirm(`Are you sure you want to delete ${subdomain}.digitel.site?`)) {
      return;
    }

    setDeletingProject(projectId);
    try {
      await databaseService.deleteProject(projectId);
      setProjects(projects.filter(p => p.$id !== projectId));
      // Note: You should also call the deployment service to remove files
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setDeletingProject(null);
    }
  }

  function getStatusBadge(status) {
    const statusStyles = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/50',
      deploying: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-500/50',
      active: 'bg-green-100 dark:bg-neon-500/20 text-green-800 dark:text-neon-500 border border-green-200 dark:border-neon-500/50 animate-pulse',
      failed: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-500/50'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusStyles[status] || statusStyles.pending}`}>
        {status}
      </span>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-500 mx-auto shadow-lg shadow-neon-500/50"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-neon-500">My Projects</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your deployed sites</p>
          </div>
          <Button onClick={() => setShowDeployModal(true)}>
            <Plus className="h-5 w-5 mr-2" />
            New Deployment
          </Button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="bg-white dark:bg-dark-300 rounded-lg shadow-lg shadow-neon-500/10 dark:shadow-neon-500/20 p-12 text-center border border-gray-200 dark:border-neon-500/30">
            <Globe className="h-16 w-16 text-gray-400 dark:text-neon-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-neon-500 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Deploy your first frontend project to get started
            </p>
            <Button onClick={() => setShowDeployModal(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Deploy Now
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.$id} className="bg-white dark:bg-dark-300 rounded-lg shadow-md hover:shadow-2xl hover:shadow-neon-500/20 transition-all hover:scale-105 p-6 border border-gray-200 dark:border-neon-500/30">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-neon-500 mb-1">
                      {project.projectName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                      <Globe className="h-4 w-4 mr-1 text-neon-500" />
                      {project.subdomain}.digitel.site
                    </p>
                  </div>
                  {getStatusBadge(project.status)}
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>

                <div className="flex space-x-2">
                  {project.status === 'active' && (
                    <a
                      href={`https://${project.subdomain}.digitel.site`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-neon-500 text-dark-500 rounded-lg hover:bg-neon-400 transition-all hover:scale-105 hover:shadow-lg hover:shadow-neon-500/50 text-sm font-bold"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Visit
                    </a>
                  )}
                  <button
                    onClick={() => handleDeleteProject(project.$id, project.subdomain)}
                    disabled={deletingProject === project.$id}
                    className="px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all hover:scale-105 text-sm disabled:opacity-50 border border-red-200 dark:border-red-500/50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deployment Modal */}
      <Modal
        isOpen={showDeployModal}
        onClose={() => setShowDeployModal(false)}
        title="Deploy New Project"
      >
        <DeploymentForm
          onSuccess={() => {
            setShowDeployModal(false);
            loadProjects();
          }}
          onCancel={() => setShowDeployModal(false)}
        />
      </Modal>
    </div>
  );
}
