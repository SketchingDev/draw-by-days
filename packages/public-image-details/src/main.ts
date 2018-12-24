import middy from "middy";
import { extractMessageFromSns } from "./extractMessageFromSns";
import { saveImageDetails } from "./image/saveImageDetails";
import { logEvent } from "./logEvent";
import { parseJsonMessagesInSns } from "./sns/parseJsonMessagesInSns";
import { validateSns } from "./sns/validateSns";

export const handler = middy(saveImageDetails)
  .use(logEvent())
  .use(validateSns()) // TODO If Terraform is filtering by SNS subject then I shouldn't need to worry about this
  .use(parseJsonMessagesInSns())
  .use(extractMessageFromSns());

module.exports = { handler };
