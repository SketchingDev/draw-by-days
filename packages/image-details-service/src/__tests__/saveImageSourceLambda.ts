import { IRecords } from "aws-types-lib";
import { model } from "dynamoose";
import lambdaTester from "lambda-tester";
import { IImageSource } from "messages-lib";
import uuidv4 from "uuid/v4";
import waitForExpect from "wait-for-expect";
import { deps, IDeps } from "../saveImageSource/saveImageSourceHandler";
import { handler } from "../saveImageSourceEntry";
import { IImage } from "../storage/image";
import { imageSchema } from "../storage/imageSchema";
import { configureLocalDynamoDB, listTables, localStackStartupTimeout } from "./utilities/dynamodb";
import { expectMessageProperty } from "./utilities/jest";

// tslint:disable-next-line:no-var-requires
require("lambda-tester").noVersionCheck();

const defaultJestTimeout = 5 * 1000;
jest.setTimeout(defaultJestTimeout + localStackStartupTimeout);

describe("Handles ImageSource message over SNS", () => {
  const tableName = "Test";
  const imageIdColumnName = "ImageId";

  beforeAll(async () => {
    configureLocalDynamoDB();
    await waitForExpect(listTables, localStackStartupTimeout);

    deps.init = (): Promise<IDeps> =>
      Promise.resolve({
        imageRecord: model<IImage, void>(tableName, imageSchema),
      });
  });

  test("Saves SNS event containing ImageSource to DynamoDB", () => {
    const imageId = uuidv4();
    const publicUrl = uuidv4();
    const imageSource: IImageSource = {
      imageId,
      publicUrl,
    };
    const snsEvent: IRecords = {
      Records: [
        {
          EventSource: "aws:sns",
          Sns: {
            Message: JSON.stringify(imageSource),
          },
        },
      ],
    };

    const ImageRecord = model<IImage, { DateId: string }>(tableName, imageSchema);

    return lambdaTester(handler)
      .event(snsEvent)
      .expectResult(async () => {
        const record = await ImageRecord.queryOne(imageIdColumnName)
          .eq(imageId)
          .exec();

        expect(record).toMatchObject({
          ImageId: imageId,
          PublicUrl: publicUrl,
        });
      });
  });

  test("Fails validation when SNS event is invalid", () => {
    const emptyEvent = {};

    return lambdaTester(handler)
      .event(emptyEvent)
      .expectError(expectMessageProperty("Event object failed validation"));
  });
});
