export default {
  async getMessage(id: string | number) {
    try {
      const response = await api.get<{ message: any }>(`/message/${id}`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch message.");
    }
  },

  async createMessage(message: any) {
    try {
      const response = await api.post<{ data: any }>("/message", message);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(
        "Error occurred while submitting the message to the server. Please try again."
      );
    }
  },

  async getStats(): Promise<any> {
    try {
      const response = await api.get<{ stats: any }>("/message/stats");
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch message stats.");
    }
  },
};
