import { ENUM_NOTIFICATION_TYPE } from '../../utilities/enum';

export interface INotification {
  title: string;
  message: string;
  seen?: boolean;
  receiver: string;
  type: (typeof ENUM_NOTIFICATION_TYPE)[keyof typeof ENUM_NOTIFICATION_TYPE];
  redirectId?: string;
}
