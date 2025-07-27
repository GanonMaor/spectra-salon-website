import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Hello from TypeScript Netlify Function!',
      event: event.httpMethod,
      timestamp: new Date().toISOString(),
    }),
  };
}; 