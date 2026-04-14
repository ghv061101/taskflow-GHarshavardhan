'use client';

import { useState } from 'react';
import { Task, CreateTaskInput, ApiErrorClass, apiClient } from '@/lib/api';

interface TaskModalProps {
  projectId: string;
  task?: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export function TaskModal({ projectId, task, onClose, onSave }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'done'>(task?.status || 'todo');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(task?.due_date || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const data: CreateTaskInput = {
        title,
        description: description || undefined,
        status,
        priority,
        due_date: dueDate || undefined,
      };

      let savedTask: Task;
      if (task) {
        savedTask = await apiClient.updateTask(task.id, data);
      } else {
        savedTask = await apiClient.createTask(projectId, data);
      }
      
      onSave(savedTask);
      onClose();
    } catch (err) {
      const message = err instanceof ApiErrorClass ? err.message : 'Failed to save task';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-950 rounded-lg shadow-xl max-w-md w-full border border-zinc-200 dark:border-zinc-800">
        <div className="p-6">
          <h2 className="text-xl font-bold text-black dark:text-white mb-4">
            {task ? 'Edit Task' : 'New Task'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="taskTitle" className="block text-sm font-medium text-black dark:text-white mb-1">
                Title
              </label>
              <input
                id="taskTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="taskDesc" className="block text-sm font-medium text-black dark:text-white mb-1">
                Description
              </label>
              <textarea
                id="taskDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="taskStatus" className="block text-sm font-medium text-black dark:text-white mb-1">
                  Status
                </label>
                <select
                  id="taskStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'todo' | 'in_progress' | 'done')}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label htmlFor="taskPriority" className="block text-sm font-medium text-black dark:text-white mb-1">
                  Priority
                </label>
                <select
                  id="taskPriority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="taskDueDate" className="block text-sm font-medium text-black dark:text-white mb-1">
                Due Date (optional)
              </label>
              <input
                id="taskDueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
              >
                {loading ? 'Saving...' : task ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onStatusChange: (status: 'todo' | 'in_progress' | 'done') => void;
  onDelete: () => void;
}

export function TaskCard({ task, onEdit, onStatusChange, onDelete }: TaskCardProps) {
  const priorityColors = {
    low: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-200',
    medium: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-200',
    high: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-200',
  };

  const statusColors = {
    todo: 'bg-zinc-100 dark:bg-zinc-800',
    in_progress: 'bg-blue-100 dark:bg-blue-900',
    done: 'bg-green-100 dark:bg-green-900',
  };

  return (
    <div className={`p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 ${statusColors[task.status]}`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-black dark:text-white">{task.title}</h3>
        <button
          onClick={onDelete}
          className="text-zinc-500 hover:text-red-600 dark:hover:text-red-400 text-sm"
        >
          Delete
        </button>
      </div>

      {task.description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        {task.due_date && (
          <span className="px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 rounded">
            Due: {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(e.target.value as 'todo' | 'in_progress' | 'done')}
          className="flex-1 px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <button
          onClick={onEdit}
          className="px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950 rounded transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
