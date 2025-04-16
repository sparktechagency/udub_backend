import { Types } from 'mongoose';
import { CONVERSATION_TYPE } from './conversation.enum';

export interface IConversation {
  participants: [Types.ObjectId];
  lastMessage: Types.ObjectId;
  projectId: Types.ObjectId | null;
  type: (typeof CONVERSATION_TYPE)[keyof typeof CONVERSATION_TYPE];
}
