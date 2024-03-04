// SPDX-License-Identifier: AGPL-3.0-only

import type { ApiResponse } from "~/types/api.response";

const contentType: string = "application/json";
const commonHeaders: HeadersInit = {
  Pragma: "no-cache",
  Accept: contentType,
  "Content-Type": contentType,
  "Cache-Control": "no-cache, no-store, must-revalidate",
};

class Api {
  private baseURL: string;

  constructor (baseURL: string) {
    this.baseURL = baseURL;
  }

  private async fetchWrapper<T> (
    url: string,
    options: RequestInit,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${url}`, options);
      let data;
      // For patch cases when there's no content returned
      if (response.status === 204) {
        data = null;
      } else {
        data = await response.json();
      }
      if (!response.ok) {
        const error = {
          status: response.status,
          message: data?.message || "An error occurred",
        };
        throw error;
      }
      return { status: response.status, data };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("Fetch Error:", error);
      }
      throw error;
    }
  }

  public get<T> (
    url: string,
    params?: Record<string, any>,
  ): Promise<ApiResponse<T>> {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    return this.fetchWrapper<T>(`${url}${queryString}`, {
      method: "GET",
      headers: commonHeaders,
    });
  }

  public post<T, U = any> (url: string, data: U): Promise<ApiResponse<T>> {
    return this.fetchWrapper<T>(url, {
      method: "POST",
      headers: commonHeaders,
      body: JSON.stringify(data),
    });
  }

  public patch<T, U = any> (
    url: string,
    data?: U,
  ): Promise<ApiResponse<T> | void> {
    return this.fetchWrapper<T>(url, {
      method: "PATCH",
      headers: commonHeaders,
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export default new Api("/api/");
