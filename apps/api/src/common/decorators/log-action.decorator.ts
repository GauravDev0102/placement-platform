import { SetMetadata } from '@nestjs/common';

export const LOG_ACTION_KEY = 'logAction';
export const LogAction = (action: string, entity: string) =>
  SetMetadata(LOG_ACTION_KEY, { action, entity });
