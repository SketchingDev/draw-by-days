import middy from "middy";
import { logEvent } from "middy-middleware-lib";
import { produceImageAvailableEventHandler } from "./produceImageAvailableEventHandler";
import { extractFirstS3Record } from "./s3/extractFirstS3Record";

export const handler = middy(produceImageAvailableEventHandler)
  .use(logEvent())
  .use(extractFirstS3Record());

module.exports = { handler };
