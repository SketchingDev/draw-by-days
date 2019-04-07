import gql from "graphql-tag";
import AWSAppSyncClient from "aws-appsync/lib";
import { DailyImage } from "./domain/dailyImage";
import "isomorphic-fetch";

export interface DailyImageRepository {
  saveAll(dailyImages: DailyImage[]): Promise<Array<DailyImage>>;
}

export class AppSyncDailyImageRepo implements DailyImageRepository {
  private static readonly createDailyImageMutationMutation = gql(`
mutation createDailyImage($url: AWSURL! $date: AWSDate!) {
    createDailyImage(
      url: $url
      date: $date
    ) {
      id
      url
      date
    }
  }
`);

  public constructor(private client: AWSAppSyncClient<any>) {}

  public async saveAll(dailyImages: DailyImage[]): Promise<Array<DailyImage>> {
    const savedImages = new Array<DailyImage>();

    for (const dailyImage of dailyImages) {
      const result = await this.client.mutate<DailyImage, DailyImage>({
        variables: { date: dailyImage.date, url: dailyImage.url },
        mutation: AppSyncDailyImageRepo.createDailyImageMutationMutation,
        fetchPolicy: "no-cache",
      });

      if (result.data) {
        savedImages.push(result.data.createDailyImage);
        console.log(`Stored image for date ${dailyImage.date}: ${dailyImage.url}`, JSON.stringify(result.data));
      }
    }

    return savedImages;
  }
}
