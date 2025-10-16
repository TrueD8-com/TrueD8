import { createClient } from 'redis';

export const client = createClient({
  url: process.env.REDIS_HOST,
  password: process.env.REDIS_PASS,
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
});
const dev = process.env.NODE_ENV !== 'production';
export const trudeskApi = dev ? 'http://localhost:8119' : 'http://localhost:8119';
