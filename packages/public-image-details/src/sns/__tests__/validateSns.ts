import { Context } from "aws-lambda";
import { IPublicImageDetails } from "messages-lib/lib";
import middy from "middy";
import { IRecords } from "../recordTypes";
import { validateSns } from "../validateSns";

const passThroughHandler = (event: IPublicImageDetails, context: Context, callback: any) => {
  callback(null, event);
};

describe("Validate SNS", () => {
  let dummyNext: jest.Mock<{}>;
  let validateSnsEvent: () => middy.IMiddyMiddlewareObject;

  beforeEach(() => {
    dummyNext = jest.fn().mockImplementation();
    validateSnsEvent = validateSns;
  });

  it("Valid event", done => {
    const snsEvent: IRecords<string> = {
      Records: [
        {
          Sns: {
            Message: "Test value",
          },
        },
      ],
    };

    const expectedSnsEvent: IRecords<string> = {
      Records: [
        {
          Sns: {
            Message: "Test value",
          },
        },
      ],
    };

    const handler = middy(passThroughHandler).use(validateSnsEvent());

    handler(snsEvent, {} as Context, (err, event) => {
      expect(err).toEqual(null);
      expect(event).toEqual(expectedSnsEvent);
      done();
    });
  });

  it("Invalid event", done => {
    const snsEvent = {
      Records: [
        {
          Sns: {},
        },
      ],
    };

    const handler = middy(passThroughHandler).use(validateSnsEvent());

    handler(snsEvent, {} as Context, (err, event) => {
      expect(err).toMatchObject({ message: "Event object failed validation" });
      expect(event).toEqual(undefined);
      done();
    });
  });
});
