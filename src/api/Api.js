import axios from "axios";
import qs from "qs";

const baseURL = process.env.VUE_APP_API_BASE_URL;
const contentType = "application/json";
const commonHeaders = {
  Pragma: "no-cache",
  Accept: contentType,
  "Content-Type": contentType,
  "Cache-Control": "no-cache, no-store, must-revalidate",
};

const apiConfig = {
  baseURL: baseURL,
  withCredentials: false,
  timeout: 60000, // 1 minute
  headers: commonHeaders,
  paramsSerializer: (params) => qs.stringify(params, { indices: false }),
};

class Api {
  constructor() {
    this.axiosInstance = axios.create(apiConfig);

    if (process.env.NODE_ENV === "development") {
      this.enableDebugForDevelopment();
    }
  }

  getUri() {
    return this.axiosInstance.getUri(apiConfig);
  }

  request() {
    return this.axiosInstance.request(apiConfig);
  }

  get(url) {
    return this.axiosInstance.get(url, apiConfig);
  }

  options(url) {
    return this.axiosInstance.options(url, apiConfig);
  }

  head(url) {
    return this.axiosInstance.head(url, apiConfig);
  }

  post(url, data) {
    return this.axiosInstance.post(url, data, apiConfig);
  }

  success(response) {
    return response.data;
  }

  error(error) {
    throw error;
  }

  enableDebugForDevelopment() {
    this.axiosInstance.interceptors.request.use((request) => {
      console.log("Starting Request", request.url);
      return request;
    });

    this.axiosInstance.interceptors.response.use((response) => {
      console.log("Response:", response.data);
      return response;
    });
  }
}

export default new Api(apiConfig);
