/* eslint-disable @typescript-eslint/no-explicit-any */
import QueryBuilder from '../../builder/QueryBuilder';
import Message from '../message/message.model';
import { User } from '../user/user.model';
import Conversation from './conversation.model';

const getConversation = async (
  profileId: string,
  query: Record<string, unknown>,
) => {
  const searchTerm = query.searchTerm as string;
  let userSearchFilter = {};

  if (searchTerm) {
    const matchingUsers = await User.find(
      { name: { $regex: searchTerm, $options: 'i' } },
      '_id',
    );

    const matchingUserIds = matchingUsers.map((user) => user._id);

    userSearchFilter = {
      participants: { $in: matchingUserIds },
    };
  }

  const currentUserConversationQuery = new QueryBuilder(
    Conversation.find({
      participants: profileId,
      ...userSearchFilter,
    })
      .sort({ updatedAt: -1 })
      .populate({
        path: 'participants',
        select: 'name profile_image _id email',
      })
      .populate('lastMessage'),
    query,
  )
    .fields()
    .filter()
    .paginate()
    .sort();

  const currentUserConversation = await currentUserConversationQuery.modelQuery;
  const conversationList = await Promise.all(
    currentUserConversation.map(async (conv: any) => {
      const countUnseenMessage = await Message.countDocuments({
        conversationId: conv._id,
        msgByUserId: { $ne: profileId },
        seen: false,
      });
      const otherUser = conv.participants.find(
        (userId: any) => userId.toString() !== profileId,
      );

      return {
        _id: conv?._id,
        userData: {
          _id: otherUser?._id,
          name: otherUser?.name,
          profileImage: otherUser?.profile_image,
          email: otherUser?.email,
        },
        unseenMsg: countUnseenMessage,
        lastMsg: conv.lastMessage,
      };
    }),
  );

  const meta = await currentUserConversationQuery.countTotal();

  return {
    meta,
    result: conversationList,
  };
};

const ConversationService = {
  getConversation,
};

export default ConversationService;
