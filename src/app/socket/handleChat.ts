/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server as IOServer, Socket } from 'socket.io';
import Conversation from '../modules/conversation/conversation.model';
import Message from '../modules/message/message.model';
import { getSingleConversation } from '../helper/getSingleConversation';

const handleChat = async (
  io: IOServer,
  socket: Socket,
  currentUserId: string,
): Promise<void> => {
  // new message -----------------------------------
  socket.on('new-message', async (data) => {
    let conversation = await Conversation.findOne({
      $and: [{ participants: data.sender }, { participants: data.receiver }],
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [data.sender, data.receiver],
      });
    }
    const messageData = {
      text: data.text,
      imageUrl: data.imageUrl || [],
      videoUrl: data.videoUrl || [],
      msgByUserId: data?.sender,
      conversationId: conversation?._id,
    };
    const saveMessage = await Message.create(messageData);
    await Conversation.updateOne(
      { _id: conversation?._id },
      {
        lastMessage: saveMessage._id,
      },
    );
    // send to the frontend only new message data ---------------
    io.to(data?.sender.toString()).emit(
      `message-${data?.receiver}`,
      saveMessage,
    );
    io.to(data?.receiver.toString()).emit(
      `message-${data?.sender}`,
      saveMessage,
    );

    //send conversation
    const conversationSender = await getSingleConversation(
      data?.sender,
      data?.receiver,
    );
    const conversationReceiver = await getSingleConversation(
      data?.receiver,
      data?.sender,
    );
    io.to(data?.sender).emit('conversation', conversationSender);
    io.to(data?.receiver).emit('conversation', conversationReceiver);
  });

  // send------------------------
  socket.on('seen', async ({ conversationId, msgByUserId }) => {
    await Message.updateMany(
      { conversationId: conversationId, msgByUserId: msgByUserId },
      { $set: { seen: true } },
    );
    //send conversation --------------
    const conversationSender = await getSingleConversation(
      currentUserId,
      msgByUserId,
    );
    const conversationReceiver = await getSingleConversation(
      msgByUserId,
      currentUserId,
    );

    io.to(currentUserId as string).emit('conversation', conversationSender);
    io.to(msgByUserId).emit('conversation', conversationReceiver);
  });
};

export default handleChat;
