import { S3CreateEvent } from "aws-lambda";
import { DailyImage } from "./domain/dailyImage";
import * as url from "url";
import { DateGenerator, EnvDependencies } from "../handler";

const convertToIsoDate = (date: Date) => date.toISOString().split("T")[0];

export const s3CreateEventToDailyImage = (app: any) => async (
  event: S3CreateEvent,
  context: { env: EnvDependencies; dateGenerator: DateGenerator },
): Promise<DailyImage[]> => {
  const { env, dateGenerator } = context;

  const dailyImages = event.Records.map(record => ({
    id: record.s3.object.key,
    date: convertToIsoDate(dateGenerator()),
    url: url.resolve(env.BASE_BUCKET_URL, record.s3.object.key),
  }));

  return await app(dailyImages, context);
};
