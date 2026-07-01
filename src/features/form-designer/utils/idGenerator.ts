import { v4 as uuidv4 } from 'uuid';
export const genId = (prefix: string = 'el') => `${prefix}-${uuidv4().slice(0, 8)}`;
