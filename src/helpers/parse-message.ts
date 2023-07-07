import { ClientMessage } from '../types/messages.js';
import { isClientMessage } from './validators.js';

export const parseMessage = async (unparsedMessage: string): Promise<ClientMessage> => {
  return new Promise((resolve, reject) => {
    try {
      const message = JSON.parse(unparsedMessage);

      if (isClientMessage(message)) {
        const { data: unparsedData } = message;

        if (typeof unparsedData !== 'string') {
          reject("Message property 'data' is not a string");
          return;
        }

        const data = JSON.parse(unparsedData);

        resolve({ ...message, data });
      }
      reject('Message have invalid format');
    } catch (error) {
      reject(error);
    }
  });
};
