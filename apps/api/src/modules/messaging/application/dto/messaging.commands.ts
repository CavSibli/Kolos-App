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
  authorFirstName: string | null;
  authorLastName: string | null;
  authorDisplayName: string;
  body: string;
  createdAt: string;
}
