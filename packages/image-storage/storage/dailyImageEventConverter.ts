import { S3CreateEvent, S3EventRecord } from "aws-lambda";
import * as url from "url";
import { DailyImage } from "./domain/dailyImage";

export type DateGenerator = () => Date;

export class DailyImageEventConverter {
  private static readonly timeDelimiter = "T";

  constructor(private dateGenerator: DateGenerator, private bucketPublicUrl: string) {}

  private static convertToIsoDate(date: Date) {
    return date.toISOString().split(DailyImageEventConverter.timeDelimiter)[0];
  }

  private mapToCreateDailyImage({ s3 }: S3EventRecord): DailyImage {
    return {
      date: DailyImageEventConverter.convertToIsoDate(this.dateGenerator()),
      url: url.resolve(this.bucketPublicUrl, s3.object.key),
    };
  }

  public convert({ Records }: S3CreateEvent) {
    return Records.map(record => this.mapToCreateDailyImage(record));
  }
}
