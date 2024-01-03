import Api from "@/api/Api.js";

export default {
  async getMessage(id) {
    try {
      const response = await Api.get(`/message/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching message:", error);
      throw error;
    }
  },

  async createMessage(message) {
    try {
      const response = await Api.post("/message", message);
      return response.data.data;
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  },
};
