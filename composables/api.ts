const contentType: string = "application/json";
const commonHeaders: HeadersInit = {
  Pragma: "no-cache",
  Accept: contentType,
  "Content-Type": contentType,
  "Cache-Control": "no-cache, no-store, must-revalidate",
};

interface ApiResponse<T = any> {
  status: number;
  data?: T;
  message?: string;
}

class Api {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async fetchWrapper<T>(
    url: string,
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${url}`, options);
      const data = await response.json();
      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || "An error occurred",
        };
      }
      return { status: response.status, data };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Fetch Error:", error);
      }
      throw error;
    }
  }

  public get<T>(
    url: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    return this.fetchWrapper<T>(`${url}${queryString}`, {
      method: "GET",
      headers: commonHeaders,
    });
  }

  public post<T, U = any>(url: string, data: U): Promise<ApiResponse<T>> {
    return this.fetchWrapper<T>(url, {
      method: "POST",
      headers: commonHeaders,
      body: JSON.stringify(data),
    });
  }
}

export default new Api("/api/");
