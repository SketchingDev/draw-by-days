import { S3CreateEvent } from "aws-lambda";
import { DailyImage } from "draw-by-days-models/lib";
import * as url from "url";
import { DateGenerator, EnvDependencies } from "../handler";
import { URL } from "url";

export const s3CreateEventToDailyImage = (app: any) => async (
  event: S3CreateEvent,
  context: { env: EnvDependencies; dateGenerator: DateGenerator },
): Promise<DailyImage[]> => {
  const { env, dateGenerator } = context;

  const dailyImages: DailyImage[] = event.Records.map(record => ({
    id: record.s3.object.key,
    date: dateGenerator(),
    url: new URL(url.resolve(env.BASE_BUCKET_URL, record.s3.object.key)),
  }));

  return await app(dailyImages, context);
};
