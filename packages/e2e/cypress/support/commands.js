import * as AWS from "aws-sdk";

const awsConfig = {
  region: "us-east-1",
  credentials: {
    accessKeyId: Cypress.env("AWS_ACCESS_KEY_ID"),
    secretAccessKey: Cypress.env("AWS_SECRET_ACCESS_KEY"),
  },
};

const lambda = new AWS.Lambda(awsConfig);
const dynamodb = new AWS.DynamoDB(awsConfig);

Cypress.Commands.add("invokeLambda", functionName => {
  return lambda.invoke({ FunctionName: functionName }).promise();
});

const clearDailyImage = async tableName => {
  await clearTableById(tableName);
};

const clearDailyImageDate = async tableName => {
  await clearTableById(tableName);
};

const clearTableById = async tableName => {
  const ids = new Set();

  const scanResult = await dynamodb
    .scan({
      ProjectionExpression: "Id",
      TableName: tableName,
    })
    .promise();

  if (scanResult.Items) {
    scanResult.Items.map(item => item.Id.S).forEach(id => ids.add(id));
  }

  for (const id of ids.values()) {
    await dynamodb
      .deleteItem({
        Key: {
          Id: {
            S: id,
          },
        },
        TableName: tableName,
      })
      .promise();
  }
};

Cypress.Commands.add("clearDailyImages", async (dailyImageTableName, dailyImageDateTableName) => {
  await clearDailyImage(dailyImageTableName);
  await clearDailyImageDate(dailyImageDateTableName);
});
