import { IPublicImageDetails } from "messages-lib/lib";
import { IRecords } from "./sns/recordTypes";

export const extractMessageFromSns = () => ({
  before: (handler: { event: IRecords<IPublicImageDetails> }, next: () => void) => {
    const record = handler.event.Records.shift();
    if (!record) {
      throw new Error("SNS message missing Record");
    }

    handler.event = record.Sns.Message as any;
    next();
  },
});
