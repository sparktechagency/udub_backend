import Conversation from '../conversation/conversation.model';
import Message from './message.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';

const getMessages = async (
  profileId: string,
  userId: string,
  query: Record<string, unknown>,
) => {
  const conversation = await Conversation.findOne({
    $and: [{ participants: profileId }, { participants: userId }],
  });

  if (conversation) {
    const messageQuery = new QueryBuilder(
      Message.find({ conversationId: conversation?._id }),
      query,
    )
      .search(['text'])
      .fields()
      .filter()
      .paginate()
      .sort();
    const result = await messageQuery.modelQuery;
    const meta = await messageQuery.countTotal();
    const userData = await User.findById(userId).select('name profile_image');
    return {
      meta,
      result: {
        conversationId: conversation._id,
        userData,
        messages: result,
      },
    };
  }
  const userData = await User.findById(userId).select('name profile_image');

  return {
    result: {
      conversationId: null,
      userData,
      messages: [],
    },
  };
};

const MessageService = {
  getMessages,
};

export default MessageService;
