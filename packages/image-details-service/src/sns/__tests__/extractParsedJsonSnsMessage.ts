import { Context } from "aws-lambda";
import { ISnsRecord } from "aws-types-lib";
import { IBasicImageDetails } from "messages-lib/messages/imageDetails";
import middy from "middy";
import { extractParsedJsonSnsMessage } from "../extractParsedJsonSnsMessage";

function createSnsRecord(message: string): ISnsRecord {
  return {
    EventSource: "aws:sns",
    Sns: {
      Message: message,
    },
  };
}

const passThroughHandler = (event: IBasicImageDetails, context: Context, callback: any) => {
  callback(null, event);
};

describe("Parse JSON messages in SNS", () => {
  let dummyNext: jest.Mock<{}>;
  let parseJsonMessage: middy.IMiddyMiddlewareObject;

  beforeEach(() => {
    dummyNext = jest.fn().mockImplementation();
    parseJsonMessage = extractParsedJsonSnsMessage();
  });

  it("JSON messages in SNS event are parsed to objects", done => {
    const testEvent = createSnsRecord('{ "test": "Hello" }');
    const expectedEvent = { test: "Hello" };

    const handler = middy(passThroughHandler).use(extractParsedJsonSnsMessage());

    handler(testEvent, {} as Context, (err, event) => {
      expect(err).toEqual(null);
      expect(event).toMatchObject(expectedEvent);
      done();
    });
  });

  it("Error is thrown if SNS message contains invalid JSON", done => {
    const testEvent = createSnsRecord("{ Not a JSON object }");

    const handler = middy(passThroughHandler).use(extractParsedJsonSnsMessage());

    handler(testEvent, {} as Context, (err, event) => {
      const message = "Failed to parse SNS message due to: Unexpected token N in JSON at position 2";
      expect(err).toMatchObject({ message });
      expect(event).toEqual(undefined);
      done();
    });
  });

  it("handler confirmed that it has finished, to allow next handler to be invoked", done => {
    const testEvent = createSnsRecord("{}");

    const handler = middy(passThroughHandler).use(extractParsedJsonSnsMessage());

    handler(testEvent, {} as Context, done);
  });
});
