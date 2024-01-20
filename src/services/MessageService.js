import Api from "@/api/Api.js";

export default {
  async getMessage(id) {
    const response = await Api.get(`/message/${id}`);
    return response.data;
  },

  async createMessage(message) {
    try {
      const response = await Api.post("/message", message);
      return response.data.data;
    } catch (error) {
      throw {
        message:
          "Error occured while submitting the message to the server. Please try again.",
      };
    }
  },

  async getStats() {
    const response = await Api.get("/message/stats");
    return response.data;
  },
};
