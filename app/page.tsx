'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useProtectedRoute } from '@/lib/use-protected-route';
import { Navbar } from '@/components/navbar';
import { apiClient, Project, ApiErrorClass } from '@/lib/api';

export default function ProjectsPage() {
  const { loading: authLoading } = useAuth();
  const { isProtected } = useProtectedRoute();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);

  const loadProjects = async () => {
    try {
      setError(null);
      const data = await apiClient.getProjects();
      setProjects(data);
    } catch (err) {
      const message = err instanceof ApiErrorClass ? err.message : 'Failed to load projects';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isProtected) {
      loadProjects();
    }
  }, [authLoading, isProtected]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setCreatingProject(true);
    try {
      const newProject = await apiClient.createProject(
        newProjectName,
        newProjectDesc || undefined
      );
      setProjects([...projects, newProject]);
      setNewProjectName('');
      setNewProjectDesc('');
      setShowNewProject(false);
    } catch (err) {
      const message = err instanceof ApiErrorClass ? err.message : 'Failed to create project';
      setError(message);
    } finally {
      setCreatingProject(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!isProtected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">Projects</h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Manage your projects and tasks
            </p>
          </div>
          <button
            onClick={() => setShowNewProject(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            New Project
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        {showNewProject && (
          <div className="mb-8 p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
              Create New Project
            </h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-black dark:text-white mb-1">
                  Project Name
                </label>
                <input
                  id="projectName"
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., Q2 Roadmap"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="projectDesc" className="block text-sm font-medium text-black dark:text-white mb-1">
                  Description (optional)
                </label>
                <textarea
                  id="projectDesc"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Add a description..."
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creatingProject || !newProjectName.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
                >
                  {creatingProject ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewProject(false);
                    setNewProjectName('');
                    setNewProjectDesc('');
                  }}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
              No projects yet
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Create your first project to get started
            </p>
            <button
              onClick={() => setShowNewProject(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="h-full p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:shadow-md dark:hover:border-zinc-700 transition-all cursor-pointer">
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                      {project.description}
                    </p>
                  )}
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    Created{' '}
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
