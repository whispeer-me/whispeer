// SPDX-License-Identifier: AGPL-3.0-only

import type { ApiResponse } from "~/types/api.response";
import type { Message } from "~/types/message";

export default {
  async getMessage(id: string) {
    return await api
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

  async increaseViewCount(id: string) {
    return await api.patch<ApiResponse>(`message/${id}`);
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
    return await api.get<{ stats: any }>("message/stats").catch((_error) => {
      throw new Error("Failed to fetch message stats.");
    });
  },
};
