// SPDX-License-Identifier: AGPL-3.0-only

export interface ApiResponse<T = any> {
  status: number;
  data?: T;
  message?: string;
}
