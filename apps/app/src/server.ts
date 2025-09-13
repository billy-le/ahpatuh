import {
  createStartHandler,
  defaultStreamHandler,
  RequestHandler,
} from '@tanstack/react-start/server';
import { createRouter } from './router';

const defineHandler: RequestHandler = (event) => {
  const startHandler = createStartHandler({
    createRouter,
  })(defaultStreamHandler);

  return startHandler(event);
};

export default defineHandler;
