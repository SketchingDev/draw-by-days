import dynamoose = require("dynamoose");

export const localStackStartupTimeout = 10 * 1000;

export const listTables = async () =>
  await dynamoose
    .ddb()
    .listTables()
    .promise();

export const configureLocalDynamoDB = () => {
  dynamoose.AWS.config.update({
    accessKeyId: "AKID",
    secretAccessKey: "SECRET",
    region: "us-east-1",
  });

  dynamoose.local("http://0.0.0.0:4569");
};
