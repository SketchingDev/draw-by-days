import { IAddDailyImageCommand } from "draw-by-days-models/lib";
import { SendMessageBatchRequest } from "aws-sdk/clients/sqs";
import { DailyImageRepository } from "./DailyImageRepository";
import AWS from "aws-sdk";
import uuidv5 from "uuid/v5";
import { Image } from "./domain/image";

export class SqsDailyImageRepo implements DailyImageRepository {
  private static readonly ID_NAMESPACE = "1b671a61-40d5-491e-99b0-da02ff1f3341";

  public constructor(private sqs: AWS.SQS, private queueUrl: string) {}

  private static convert(image: Image): IAddDailyImageCommand {
    return {
      id: image.id!,
      url: image.url.toString(),
    };
  }

  public async saveAll(images: Image[]): Promise<Image[]> {
    const records = images.map(image => SqsDailyImageRepo.convert(image));

    const batch: SendMessageBatchRequest = {
      QueueUrl: this.queueUrl,
      Entries: records.map(record => ({
        Id: uuidv5(record.id!, SqsDailyImageRepo.ID_NAMESPACE),
        MessageBody: JSON.stringify(record),
      })),
    };

    await this.sqs.sendMessageBatch(batch).promise();

    return images;
  }
}
