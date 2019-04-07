import { URL } from "url";
import AWS from "aws-sdk";
import fetch from "node-fetch";

export type saveRemoteFileToS3 = (sourceUrl: URL, s3ObjectName: string) => Promise<void>;

export const saveRemoteFileToS3Factory = (s3: AWS.S3, bucketName: string): saveRemoteFileToS3 => async (
  sourceUrl: URL,
  s3ObjectName: string,
) => {
  const response = await fetch(sourceUrl.toString());
  if (!response.ok) {
    throw new Error(`Failed to download ${sourceUrl.toString()}`);
  }

  await s3
    .putObject({
      Bucket: bucketName,
      Key: s3ObjectName,
      Body: await response.buffer(),
    })
    .promise();
};
