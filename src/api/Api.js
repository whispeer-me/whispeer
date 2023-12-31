import axios from "axios";

const API_URL = process.env.VUE_APP_API_URL || "http://localhost:3000";

const Api = {
  async get(url) {
    try {
      const response = await axios.get(`${API_URL}${url}`);
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  post(url, data) {
    try {
      return axios.post(`${API_URL}${url}`, data);
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
};

export default Api;
