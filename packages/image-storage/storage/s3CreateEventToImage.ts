import { S3CreateEvent } from "aws-lambda";
import * as url from "url";
import { URL } from "url";
import { EnvDependencies } from "../handler";
import { Image } from "./domain/image";

export const s3CreateEventToImage = (app: any) => async (
  event: S3CreateEvent,
  context: { env: EnvDependencies },
): Promise<Image[]> => {
  const { env } = context;

  const images: Image[] = event.Records.map(record => ({
    id: record.s3.object.key,
    url: new URL(url.resolve(env.BASE_BUCKET_URL, record.s3.object.key)),
  }));

  return await app(images, context);
};
