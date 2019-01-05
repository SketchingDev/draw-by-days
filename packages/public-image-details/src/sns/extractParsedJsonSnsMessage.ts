import { ISnsRecord } from "aws-types-lib";

export const extractParsedJsonSnsMessage = () => ({
  before: (handler: { event: ISnsRecord }, next: () => void) => {
    try {
      handler.event = JSON.parse(handler.event.Sns.Message);
    } catch (err) {
      throw new Error(`Failed to parse SNS message due to: ${err.message}`);
    }

    next();
  },
});
