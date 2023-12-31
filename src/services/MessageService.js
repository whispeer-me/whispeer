// src/services/MessageService.js
import axios from "axios";

const API_URL = process.env.VUE_APP_API_URL || "http://localhost:3000";

export default {
  async getMessage(messageId) {
    try {
      const response = await axios.get(`${API_URL}/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw new Error("Error fetching message: " + error.message);
    }
  },
};
