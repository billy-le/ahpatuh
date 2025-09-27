import triggers from './triggers';
import {
  mutation as rawMutation,
  internalMutation as rawInternalMutation,
} from './_generated/server';
import {
  customCtx,
  customMutation,
} from 'convex-helpers/server/customFunctions';

export const triggerMutation = customMutation(
  rawMutation,
  customCtx(triggers.wrapDB),
);

export const triggerInternalMutation = customMutation(
  rawInternalMutation,
  customCtx(triggers.wrapDB),
);
