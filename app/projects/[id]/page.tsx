'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useProtectedRoute } from '@/lib/use-protected-route';
import { Navbar } from '@/components/navbar';
import { TaskModal, TaskCard } from '@/components/task-modal';
import { apiClient, ProjectDetail, Task, ApiErrorClass } from '@/lib/api';

export default function ProjectDetailPage() {
  const { loading: authLoading } = useAuth();
  const { isProtected } = useProtectedRoute();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [showNewTask, setShowNewTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!authLoading && isProtected) {
      const loadProject = async () => {
        try {
          setError(null);
          const data = await apiClient.getProject(projectId);
          setProject(data);
        } catch (err) {
          const message = err instanceof ApiErrorClass ? err.message : 'Failed to load project';
          setError(message);
        } finally {
          setLoading(false);
        }
      };
      loadProject();
    }
  }, [authLoading, isProtected, projectId]);

  const handleTaskSave = (savedTask: Task) => {
    if (!project) return;

    if (editingTask) {
      setProject({
        ...project,
        tasks: project.tasks.map((t) => (t.id === savedTask.id ? savedTask : t)),
      });
    } else {
      setProject({
        ...project,
        tasks: [...project.tasks, savedTask],
      });
    }
    setEditingTask(null);
    setShowNewTask(false);
  };

  const handleStatusChange = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    if (!project) return;

    try {
      const updatedTask = await apiClient.updateTask(taskId, { status: newStatus });
      setProject({
        ...project,
        tasks: project.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
      });
    } catch (err) {
      const message = err instanceof ApiErrorClass ? err.message : 'Failed to update task';
      setError(message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!project) return;
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await apiClient.deleteTask(taskId);
      setProject({
        ...project,
        tasks: project.tasks.filter((t) => t.id !== taskId),
      });
    } catch (err) {
      const message = err instanceof ApiErrorClass ? err.message : 'Failed to delete task';
      setError(message);
    }
  };

  const filteredTasks = (project?.tasks || []).filter(
    (task) => statusFilter === 'all' || task.status === statusFilter
  );

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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Project not found'}</p>
            <Link href="/" className="text-blue-600 hover:underline">
              Back to projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                Projects
              </Link>
              <span className="text-zinc-400">/</span>
            </div>
            <h1 className="text-3xl font-bold text-black dark:text-white">
              {project.name}
            </h1>
            {project.description && (
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                {project.description}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowNewTask(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            New Task
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Status Filter */}
        <div className="mb-6 flex gap-2">
          {(['all', 'todo', 'in_progress', 'done'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              {status === 'all'
                ? 'All'
                : status === 'todo'
                  ? 'To Do'
                  : status === 'in_progress'
                    ? 'In Progress'
                    : 'Done'}
            </button>
          ))}
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
              {project.tasks.length === 0 ? 'No tasks yet' : 'No tasks in this status'}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              {project.tasks.length === 0
                ? 'Create your first task to get started'
                : 'Try a different filter or create a new task'}
            </p>
            <button
              onClick={() => setShowNewTask(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              Create Task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => setEditingTask(task)}
                onStatusChange={(status) => handleStatusChange(task.id, status)}
                onDelete={() => handleDeleteTask(task.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewTask && (
        <TaskModal
          projectId={projectId}
          onClose={() => setShowNewTask(false)}
          onSave={handleTaskSave}
        />
      )}

      {editingTask && (
        <TaskModal
          projectId={projectId}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleTaskSave}
        />
      )}
    </div>
  );
}
