export interface ConversationRecord {
  id: string;
  missionId: number;
  participantIds: string[];
  createdAt: Date;
}

export interface ConversationRepository {
  findByMissionId(missionId: number): Promise<ConversationRecord | null>;
  getOrCreate(
    missionId: number,
    participantIds: string[],
  ): Promise<ConversationRecord>;
}
