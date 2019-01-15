import { IRecords, IS3Record, ISnsRecord } from "aws-types-lib";

const snsRecordFilter = (eventRecord: ISnsRecord | IS3Record) =>
  "EventSource" in eventRecord && eventRecord.EventSource === "aws:sns";

export const extractFirstSnsRecord = () => ({
  before: (handler: { event: IRecords }, next: () => void) => {
    const records = handler.event.Records;
    const snsRecords = records.filter(snsRecordFilter) as ISnsRecord[];

    if (snsRecords.length === 0) {
      throw new Error("No SNS records found");
    }

    handler.event = snsRecords[0] as any;
    next();
  },
});
