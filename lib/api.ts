const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface ApiError {
  error: string;
  fields?: Record<string, string>;
}

export class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // JSON Server doesn't need auth headers
    // if (this.token) {
    //   headers['Authorization'] = `Bearer ${this.token}`;
    // }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = data;
      throw new ApiErrorClass(error.error, response.status, error.fields);
    }

    return data;
  }

  // Auth endpoints - Mock implementation for JSON Server
  async register(name: string, email: string, password: string) {
    // Check if user already exists
    const users = await this.request<UserWithPassword[]>('/users');
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new ApiErrorClass('User already exists', 400, { email: 'already exists' });
    }

    // Create new user
    const newUser = await this.request<UserWithPassword>('/users', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, created_at: new Date().toISOString() }),
    });

    // Mock token generation
    const token = `mock-token-${newUser.id}`;
    return { token, user: { id: newUser.id, name: newUser.name, email: newUser.email, created_at: newUser.created_at } };
  }

  async login(email: string, password: string) {
    const users = await this.request<UserWithPassword[]>('/users');
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new ApiErrorClass('Invalid credentials', 401);
    }

    // Mock token generation
    const token = `mock-token-${user.id}`;
    return { token, user: { id: user.id, name: user.name, email: user.email, created_at: user.created_at } };
  }

  // Project endpoints
  async getProjects() {
    // For demo purposes, return all projects (in real app, would filter by user)
    return this.request<Project[]>('/projects', { method: 'GET' });
  }

  async getProject(id: string) {
    const project = await this.request<Project>(`/projects/${id}`, { method: 'GET' });
    const tasks = await this.request<Task[]>(`/tasks?project_id=${id}`, { method: 'GET' });
    return { ...project, tasks };
  }

  async createProject(name: string, description?: string) {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        owner_id: 'user-1', // Mock owner for demo
        created_at: new Date().toISOString()
      }),
    });
  }

  async updateProject(id: string, name: string, description?: string) {
    return this.request<Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, description }),
    });
  }

  async deleteProject(id: string) {
    return this.request<void>(`/projects/${id}`, { method: 'DELETE' });
  }

  // Task endpoints
  async getTasks(projectId: string, status?: string, assigneeId?: string) {
    const params = new URLSearchParams();
    params.append('project_id', projectId);
    if (status) params.append('status', status);
    if (assigneeId) params.append('assignee_id', assigneeId);

    return this.request<Task[]>(
      `/tasks?${params.toString()}`,
      { method: 'GET' }
    );
  }

  async createTask(projectId: string, data: CreateTaskInput) {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        project_id: projectId,
        created_at: new Date().toISOString()
      }),
    });
  }

  async updateTask(id: string, data: Partial<UpdateTaskInput>) {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string) {
    return this.request<void>(`/tasks/${id}`, { method: 'DELETE' });
  }
}

export class ApiErrorClass extends Error {
  constructor(
    message: string,
    public status: number,
    public fields?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = new ApiClient();

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
}

export interface ProjectDetail extends Project {
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  project_id: string;
  assignee_id?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  assignee_id?: string;
  due_date?: string;
}

export interface UpdateTaskInput extends CreateTaskInput {
  id: string;
}
