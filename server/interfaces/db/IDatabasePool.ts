export interface IDatabasePool {
  query: (
    text: string,
    params?: any[]
  ) => Promise<{ rows: any[]; rowCount: number | null }>;
}
