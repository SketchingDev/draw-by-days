import AWS from "aws-sdk";
import AsyncRetry = require("async-retry");

export class S3Fixture {
  private static readonly retryEverySecond = (retries: number, retryMessage: string) => ({
    retries,
    factor: 1,
    onRetry: () => console.log(retryMessage),
  });

  private static readonly RETRY_FOR_TEN_SECONDS = { delay: 1, maxAttempts: 10 };

  private static readonly dummyParams = {
    apiVersion: "2006-03-01",
    s3ForcePathStyle: true, // Necessary for local instance of S3
    credentials: {
      accessKeyId: "ACCESSKEYID",
      secretAccessKey: "SECRETACCESSKEY",
    },
  };

  public static createLocalClient(endpoint: string) {
    const config = { ...S3Fixture.dummyParams, endpoint };
    return new S3Fixture(new AWS.S3(config));
  }

  public constructor(private s3: AWS.S3) {}

  public get client() {
    return this.s3;
  }

  public async createRandomBucket(): Promise<string> {
    const bucketName = "test-bucket-name";
    await this.createBucket(bucketName);

    return bucketName;
  }

  public async createBucket(name: string) {
    await this.s3
      .createBucket({
        Bucket: name,
      })
      .promise();
  }

  public async listObjects(name: string) {
    return await this.s3.listObjects({ Bucket: name }).promise();
  }

  public async waitForObject(bucketName: string, objectKey: string) {
    return await this.s3
      .waitFor("objectExists", { Bucket: bucketName, Key: objectKey, $waiter: S3Fixture.RETRY_FOR_TEN_SECONDS })
      .promise();
  }

  public async deleteBucket(bucketName: string) {
    const objects = await this.s3.listObjects({ Bucket: bucketName }).promise();
    if (objects.Contents) {
      const objectsToDelete = objects.Contents.map(object => ({ Key: object.Key! }));
      await this.s3
        .deleteObjects({
          Bucket: bucketName,
          Delete: {
            Objects: objectsToDelete,
          },
        })
        .promise();
    }

    await this.s3.deleteBucket({ Bucket: bucketName }).promise();
  }

  public async waitForS3(secondsTimeout: number) {
    // s3.waitFor cannot handle invalid responses returned from localstack starting
    await AsyncRetry(
      async () => await this.s3.listBuckets().promise(),
      S3Fixture.retryEverySecond(secondsTimeout, "Waiting for S3..."),
    );
  }
}
