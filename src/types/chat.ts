
export interface Message {
  id: number;
  content: string;
  sender: 'user' | 'agent1' | 'agent2' | 'agent3';
  timestamp: Date;
  model?: string;
  avatarSrc?: string;
}
