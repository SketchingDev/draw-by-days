import { Context } from "aws-lambda";
import { IPublicImageDetails } from "messages-lib/lib";
import middy from "middy";
import { parseJsonMessagesInSns } from "../parseJsonMessagesInSns";
import { IRecord, IRecords } from "../recordTypes";

function createSnsEvent<T>(messages: T[]): IRecords<T> {
  const records = messages.map(
    (message): IRecord<T> => ({
      Sns: {
        Message: message,
      },
    }),
  );

  return {
    Records: records,
  };
}

const passThroughHandler = (event: IPublicImageDetails, context: Context, callback: any) => {
  callback(null, event);
};

describe("Parse JSON messages in SNS", () => {
  let dummyNext: jest.Mock<{}>;
  let parseJsonMessage: middy.IMiddyMiddlewareObject;

  beforeEach(() => {
    dummyNext = jest.fn().mockImplementation();
    parseJsonMessage = parseJsonMessagesInSns();
  });

  it("Event with no Records is returned", done => {
    const testEvent = { Records: [] };

    const expectedEvent = { Records: [] };

    const handler = middy(passThroughHandler).use(parseJsonMessagesInSns());

    handler(testEvent, {} as Context, (err, event) => {
      expect(err).toEqual(null);
      expect(event).toEqual(expectedEvent);
      done();
    });
  });

  it("JSON messages in SNS event are parsed to objects", done => {
    const testEvent = createSnsEvent(['{ "test": "Hello" }', '{ "test": "World" }']);

    const expectedEvent = createSnsEvent([{ test: "Hello" }, { test: "World" }]);

    const handler = middy(passThroughHandler).use(parseJsonMessagesInSns());

    handler(testEvent, {} as Context, (err, event) => {
      expect(err).toEqual(null);
      expect(event).toMatchObject(expectedEvent);
      done();
    });
  });

  it("Error is thrown if SNS message contains invalid JSON", done => {
    const testEvent = createSnsEvent(["{ Not a JSON object }"]);

    const handler = middy(passThroughHandler).use(parseJsonMessagesInSns());

    handler(testEvent, {} as Context, (err, event) => {
      const message = "Failed to parse SNS message due to: Unexpected token N in JSON at position 2";
      expect(err).toMatchObject({ message });
      expect(event).toEqual(undefined);
      done();
    });
  });

  it("handler confirmed that it has finished, to allow next handler to be invoked", done => {
    const testEvent = createSnsEvent(["{}"]);

    const handler = middy(passThroughHandler).use(parseJsonMessagesInSns());

    handler(testEvent, {} as Context, done);
  });
});
