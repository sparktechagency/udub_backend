/* eslint-disable @typescript-eslint/no-explicit-any */
import Conversation from '../conversation/conversation.model';
import Message from './message.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';
import { Project } from '../project/project.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';

const getMessages = async (
  profileId: string,
  paylaod: any,
  query: Record<string, unknown>,
) => {
  if (paylaod.userId) {
    const conversation = await Conversation.findOne({
      $and: [{ participants: profileId }, { participants: paylaod.userId }],
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
      const userData = await User.findById(paylaod.userId).select(
        'name profile_image',
      );
      return {
        meta,
        result: {
          conversationId: conversation._id,
          info: userData,
          messages: result,
        },
      };
    }
    const userData = await User.findById(paylaod.userId).select(
      'name profile_image',
    );

    return {
      result: {
        conversationId: null,
        info: userData,
        messages: [],
      },
    };
  } else {
    const conversation = await Conversation.findOne({
      projectId: paylaod.projectId,
      type: paylaod.projectType,
    });
    if (!conversation) {
      throw new AppError(httpStatus.NOT_FOUND, 'Conversation not found');
    }
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

    const projectData = await Project.findById(paylaod.projectId).select(
      'name title projectImage',
    );
    return {
      meta,
      result: {
        conversationId: conversation._id,
        info: projectData,
        messages: result,
      },
    };
  }
};

const MessageService = {
  getMessages,
};

export default MessageService;
