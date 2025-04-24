/* eslint-disable @typescript-eslint/no-explicit-any */
import Conversation from '../modules/conversation/conversation.model';
import Message from '../modules/message/message.model';

// export const getSingleConversation = async (
//   currentUserId: string,
//   receiverId: string,
// ) => {
//   if (!currentUserId || !receiverId) return null;

//   const conversation = await Conversation.findOne({
//     $and: [{ participants: currentUserId }, { participants: receiverId }],
//   })
//     .sort({ updatedAt: -1 })
//     .populate({
//       path: 'participants',
//       select: 'name profile_image _id email',
//     })
//     .populate({ path: 'lastMessage', model: 'Message' });

//   if (!conversation) return null;
//   const countUnseenMessage = await Message.countDocuments({
//     conversationId: conversation._id,
//     msgByUserId: { $ne: currentUserId },
//     seen: false,
//   });

//   const otherUser: any = conversation.participants.find(
//     (participant: any) => participant._id.toString() !== currentUserId,
//   );

//   return {
//     _id: conversation._id,
//     userData: {
//       _id: otherUser?._id,
//       name: otherUser?.name,
//       email: otherUser.email,
//       profileImage: otherUser?.profile_image,
//     },
//     unseenMsg: countUnseenMessage,
//     lastMsg: conversation.lastMessage,
//   };
// };
export const getSingleConversation = async (
  conversationId: any,
  currentUserId: string,
) => {
  const conversation = await Conversation.findById(conversationId)
    .sort({ updatedAt: -1 })
    .populate({
      path: 'participants',
      select: 'name profile_image _id email',
    })
    .populate({ path: 'lastMessage', model: 'Message' })
    .populate({ path: 'projectId', select: 'name title projectImage' });

  if (!conversation) return null;
  const countUnseenMessage = await Message.countDocuments({
    conversationId: conversation._id,
    msgByUserId: { $ne: currentUserId },
    seen: false,
  });

  const otherUser: any = conversation.participants.find(
    (participant: any) => participant._id.toString() !== currentUserId,
  );

  return {
    _id: conversation._id,
    userData: {
      _id: otherUser?._id,
      name: otherUser?.name,
      email: otherUser.email,
      profileImage: otherUser?.profile_image,
    },
    project: conversation.projectId,
    type: conversation.type,
    unseenMsg: countUnseenMessage,
    lastMsg: conversation.lastMessage,
  };
};
