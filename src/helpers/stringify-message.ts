import { isClientMessage } from './validators.js';

export const stringifyMessage = (message: unknown): string => {
  if (!isClientMessage(message)) {
    throw new Error('Message have invalid format');
  }

  const data = JSON.stringify(message.data);

  return JSON.stringify({ ...message, data });
};
