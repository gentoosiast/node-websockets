import { randomUUID } from 'node:crypto';

export const generateUUID = (): string => {
  return randomUUID();
};
