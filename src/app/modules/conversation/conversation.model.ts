import { model, Schema } from 'mongoose';
import { IConversation } from './conversation.interface';
import { CONVERSATION_TYPE } from './conversation.enum';

const conversationSchema = new Schema<IConversation>(
  {
    participants: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    projectId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    type: {
      type: String,
      enum: Object.values(CONVERSATION_TYPE),
      default: CONVERSATION_TYPE.ONE_TO_ONE,
    },
  },
  {
    timestamps: true,
  },
);
conversationSchema.index({ sender: 1, receiver: 1 });

const Conversation = model<IConversation>('Conversation', conversationSchema);

export default Conversation;
