import middy from "middy";
import { logEvent } from "middy-middleware-lib";
import { produceImageAvailableEventHandler } from "./produceImageAvailableEventHandler";

export const handler = middy(produceImageAvailableEventHandler).use(logEvent());

module.exports = { handler };
