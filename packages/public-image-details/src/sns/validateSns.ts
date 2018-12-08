import { validator } from "middy/middlewares";

export const snsSchema = {
  properties: {
    Records: {
      items: {
        properties: {
          EventSource: {
            type: "string",
          },
          EventSubscriptionArn: {
            type: "string",
          },
          EventVersion: {
            type: "string",
          },
          Sns: {
            properties: {
              Message: {
                type: "string",
              },
              MessageAttributes: {
                properties: {
                  Test: {
                    properties: {
                      Type: {
                        type: "string",
                      },
                      Value: {
                        type: "string",
                      },
                    },
                    type: "object",
                  },
                  TestBinary: {
                    properties: {
                      Type: {
                        type: "string",
                      },
                      Value: {
                        type: "string",
                      },
                    },
                    type: "object",
                  },
                },
                type: "object",
              },
              MessageId: {
                type: "string",
              },
              Signature: {
                type: "string",
              },
              SignatureVersion: {
                type: "string",
              },
              SigningCertUrl: {
                type: "string",
              },
              Subject: {
                type: "string",
              },
              Timestamp: {
                type: "string",
              },
              TopicArn: {
                type: "string",
              },
              Type: {
                type: "string",
              },
              UnsubscribeUrl: {
                type: "string",
              },
            },
            required: ["Message"],
            type: "object",
          },
        },
        required: ["Sns"],
        type: "object",
      },
      type: "array",
    },
  },
  required: ["Records"],
  type: "object",
};

export const validateSns = () =>
  validator({
    inputSchema: snsSchema,
  });
