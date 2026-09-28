export interface ListMessagesCommand {
  missionId: number;
  userId: string;
}

export interface PostMessageCommand {
  missionId: number;
  userId: string;
  body: string;
}

export interface MessageResult {
  id: string;
  conversationId: string;
  missionId: number;
  userId: string;
  body: string;
  createdAt: string;
}
