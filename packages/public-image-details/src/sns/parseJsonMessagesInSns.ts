import { IRecords } from "./recordTypes";

export const parseJsonMessagesInSns = () => ({
  before: (handler: { event: IRecords<string> }, next: () => void) => {
    const { event } = handler;
    event.Records.map(record => {
      const { Sns } = record;
      if (Sns) {
        try {
          Sns.Message = JSON.parse(Sns.Message);
        } catch (err) {
          throw new Error(`Failed to parse SNS message due to: ${err.message}`);
        }
      }
    });

    next();
  },
});
