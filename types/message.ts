export interface Message {
  id: string;
  content: string;
  salt: string | null;
  iv: string | null;
  is_private: boolean;
  view_count: number;
  created_at: string;
  expires_in: string;
}
