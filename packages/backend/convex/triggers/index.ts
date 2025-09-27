import { Triggers } from 'convex-helpers/server/triggers';
import { DataModel } from '../_generated/dataModel';
import { registerBusinessHoursTriggers } from './business_hours';
import { registerShiftTriggers } from './shifts';

const triggers = new Triggers<DataModel>();

registerBusinessHoursTriggers(triggers);
registerShiftTriggers(triggers);

export default triggers;
