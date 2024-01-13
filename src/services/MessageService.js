import Api from "@/api/Api.js";

export default {
  async getMessage(id) {
    const response = await Api.get(`/message/${id}`);
    return response.data;
  },

  async createMessage(message) {
    const response = await Api.post("/message", message);
    return response.data.data;
  },

  async getStats() {
    const response = await Api.get("/message/stats");
    return response.data;
  },
};
