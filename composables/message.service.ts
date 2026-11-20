// SPDX-License-Identifier: AGPL-3.0-only

import type { ApiResponse } from "~/types/api.response";
import type { EncryptedPayload } from "~/types/encrypted.message";
import type { Message } from "~/types/message";

export default {
  async getMessage (id: string) {
    return await api
      .get<Message>(`message/${id}`)
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

  // Burn after read: returns the encrypted payload once; the server deletes it.
  async openMessage (id: string) {
    return await api
      .post<EncryptedPayload>(`message/${id}/open`, {})
      .catch((error) => {
        if (error.status === 404) {
          throw new Error(
            "This message was already opened or has expired. It no longer exists.",
          );
        }

        throw new Error("Failed to open message.");
      });
  },

  async increaseViewCount (id: string) {
    return await api.patch<ApiResponse>(`message/${id}`);
  },

  async createMessage (message: EncryptedPayload): Promise<{ id: string }> {
    try {
      const response = await api.post<{ id: string }>("message", message);
      return response.data as { id: string };
    } catch (error: any) {
      throw new Error(
        "Error occurred while submitting the message to the server. Please try again.",
      );
    }
  },

  async getStats (): Promise<any> {
    return await api.get<{ stats: any }>("message/stats").catch((_error) => {
      throw new Error("Failed to fetch message stats.");
    });
  },
};
