export interface MessageRecord {
  id: string;
  conversationId: string;
  missionId: number;
  userId: string;
  body: string;
  createdAt: Date;
}

export interface MessageRepository {
  listByConversationId(conversationId: string): Promise<MessageRecord[]>;
  insert(input: {
    conversationId: string;
    missionId: number;
    userId: string;
    body: string;
    createdAt: Date;
  }): Promise<MessageRecord>;
}
