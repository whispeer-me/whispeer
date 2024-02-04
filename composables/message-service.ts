import type { ApiResponse } from "~/types/api.response";
import type { Message } from "~/types/message";

export default {
  async getMessage(id: string) {
    return api
      .get<ApiResponse<{ message: Message }>>(`message/${id}`)
      .then((data) => {
        return data;
      })
      .catch((error) => {
        if (error.status === 404) {
          throw new Error(error.message);
        }

        throw new Error("Failed to fetch message.");
      });
  },

  async createMessage(message: any) {
    try {
      const response = await api.post<{ data: any }>("message", message);
      return response.data;
    } catch (error: any) {
      throw new Error(
        "Error occurred while submitting the message to the server. Please try again."
      );
    }
  },

  async getStats(): Promise<any> {
    try {
      const response = await api.get<{ stats: any }>("message/stats");
      return response.data;
    } catch (_error) {
      throw new Error("Failed to fetch message stats.");
    }
  },
};
