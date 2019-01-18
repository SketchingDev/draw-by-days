import { IRecords } from "aws-types-lib";
import { model } from "dynamoose";
import lambdaTester from "lambda-tester";
import { IBasicImageDetails } from "messages-lib/lib/messages/imageDetails";
import uuidv4 from "uuid/v4";
import waitForExpect from "wait-for-expect";
import { deps, IDeps } from "../saveImageDetails/saveImageDetailsHandler";
import { handler } from "../saveImageDetailsEntry";
import { IImage } from "../storage/image";
import { imageSchema } from "../storage/imageSchema";
import { configureLocalDynamoDB, listTables, localStackStartupTimeout } from "./utilities/dynamodb";
import { expectMessageProperty } from "./utilities/jest";

// tslint:disable-next-line:no-var-requires
require("lambda-tester").noVersionCheck();

const defaultJestTimeout = 5 * 1000;
jest.setTimeout(defaultJestTimeout + localStackStartupTimeout);

describe("Handles ImageDetails message over SNS", () => {
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

  test("Saves SNS event containing ImageDetails to DynamoDB", () => {
    const imageId = uuidv4();
    const description = uuidv4();
    const imageDetails: IBasicImageDetails = {
      imageId,
      description,
    };
    const snsEvent: IRecords = {
      Records: [
        {
          EventSource: "aws:sns",
          Sns: {
            Message: JSON.stringify(imageDetails),
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
          Description: description,
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
