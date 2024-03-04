// SPDX-License-Identifier: AGPL-3.0-only

export type ApiResponse<T = any> = {
  status: number;
  data?: T;
  message?: string;
};
