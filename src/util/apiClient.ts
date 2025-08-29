
export class ApiClient {
    private BASE_URL = import.meta.env.DEV ? ' http://localhost:3001/api' : '';
  
    async get<T>(url: string): Promise<T> {
      const fullUrl = `${this.BASE_URL}${url.replace(/^\/\//, '/')}`;
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error('Network error');
      return response.json();
    }
  }
  
  export const apiClient = new ApiClient();