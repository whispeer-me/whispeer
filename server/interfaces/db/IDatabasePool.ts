// SPDX-License-Identifier: AGPL-3.0-only

export interface IDatabasePool {
  query: (
    text: string,
    params?: any[]
  ) => Promise<{ rows: any[]; rowCount: number | null }>;
}
