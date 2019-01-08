import { IRecords, IS3Record, ISnsRecord } from "aws-types-lib";

const s3RecordFilter = (eventRecord: ISnsRecord | IS3Record) =>
  "eventSource" in eventRecord && eventRecord.eventSource === "aws:s3";

export const extractFirstS3Record = () => ({
  before: (handler: { event: IRecords }, next: () => void) => {
    const records = handler.event.Records;
    const s3Records = records.filter(s3RecordFilter) as IS3Record[];

    if (s3Records.length === 0) {
      throw new Error("No S3 records found");
    }

    handler.event = s3Records[0] as any;
    next();
  },
});
