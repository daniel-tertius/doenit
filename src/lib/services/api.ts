import { FUNCTIONS_URLS } from '../firebase';
import { AuthService } from './auth';

class ApiService {
  private async makeRequest(functionName: keyof typeof FUNCTIONS_URLS, options: RequestInit = {}) {
    const token = await AuthService.getAuthToken();

    const config: RequestInit = {
      ...options,
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(FUNCTIONS_URLS[functionName], config);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Task operations
  async getTasks() {
    return this.makeRequest("getTasks");
  }

  async createTask(task: {
    title: string;
    description?: string;
    category?: string;
    priority?: string;
    dueDate?: string;
  }) {
    return this.makeRequest("createTask", {
      method: "POST",
      body: JSON.stringify(task),
    });
  }

  async updateTask(taskId: string, updates: any) {
    return this.makeRequest("updateTask", {
      method: "PUT",
      body: JSON.stringify({ taskId, ...updates }),
    });
  }

  async deleteTask(taskId: string) {
    return this.makeRequest("deleteTask", {
      method: "DELETE",
      body: JSON.stringify({ taskId }),
    });
  }

  // Category operations
  async getCategories() {
    return this.makeRequest("getCategories");
  }

  async createCategory(category: { name: string; color: string }) {
    return this.makeRequest("createCategory", {
      method: "POST",
      body: JSON.stringify(category),
    });
  }

  // Backup operations
  async createBackup() {
    return this.makeRequest("createBackup", {
      method: "POST",
    });
  }

  async restoreBackup(backupId: string) {
    return this.makeRequest("restoreBackup", {
      method: "POST",
      body: JSON.stringify({ backupId }),
    });
  }
}

export const api = new ApiService();
