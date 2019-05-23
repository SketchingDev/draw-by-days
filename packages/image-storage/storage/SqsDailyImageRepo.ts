import { DailyImage } from "./domain/dailyImage";
import { SendMessageBatchRequest } from "aws-sdk/clients/sqs";
import { DailyImageAddedMessage } from "./domain/dailyImageAddedMessage";
import { DailyImageRepository } from "./DailyImageRepository";
import AWS from "aws-sdk";
import uuidv5 from "uuid/v5";

const ID_NAMESPACE = "1b671a61-40d5-491e-99b0-da02ff1f3341";

export class SqsDailyImageRepo implements DailyImageRepository {
  public constructor(private sqs: AWS.SQS, private queueUrl: string) {}

  private static convert(dailyImage: DailyImage): DailyImageAddedMessage {
    return {
      id: dailyImage.id,
      url: dailyImage.url,
      date: dailyImage.date,
    };
  }

  public async saveAll(dailyImages: DailyImage[]): Promise<DailyImage[]> {
    const records = dailyImages.map(image => SqsDailyImageRepo.convert(image));

    const batch: SendMessageBatchRequest = {
      QueueUrl: this.queueUrl,
      Entries: records.map(record => ({
        Id: uuidv5(record.id!, ID_NAMESPACE),
        MessageBody: JSON.stringify(record),
      })),
    };

    await this.sqs.sendMessageBatch(batch).promise();

    return dailyImages;
  }
}
