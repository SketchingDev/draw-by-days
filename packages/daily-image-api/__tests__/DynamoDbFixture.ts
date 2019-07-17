import AWS from "aws-sdk";
import { PutItemInputAttributeMap } from "aws-sdk/clients/dynamodb";

export class DynamoDbFixture {
  private static readonly dummyParams = {
    region: "localhost",
    accessKeyId: "DEFAULT_ACCESS_KEY",
    secretAccessKey: "DEFAULT_SECRET",
  };

  public static createLocalClient(endpoint: string) {
    const config = { ...DynamoDbFixture.dummyParams, endpoint };
    return new DynamoDbFixture(new AWS.DynamoDB(config));
  }

  constructor(private dynamoDb: AWS.DynamoDB) {}

  public get client() {
    return this.dynamoDb;
  }

  public async waitForDynamoDb() {
    await this.dynamoDb.waitFor("tableNotExists", { TableName: "non-existent-table" }).promise();
  }

  private async deleteByIds(ids: string[], tableName: string) {
    for (const id of ids) {
      await this.dynamoDb.deleteItem({ Key: { Id: { S: id } }, TableName: tableName }).promise();
    }
  }

  private async getIds(tableName: string) {
    const results = await this.dynamoDb.scan({ TableName: tableName }).promise();
    if (results.Items) {
      return results.Items.filter(item => "Id" in item && item.Id.S).map(item => item.Id.S!);
    }
    return [];
  }

  public async purgeTable(tableName: string) {
    await this.deleteByIds(await this.getIds(tableName), tableName);
  }

  public async insertTestData(tableName: string, item: PutItemInputAttributeMap) {
    const params = {
      Item: item,
      ReturnConsumedCapacity: "TOTAL",
      TableName: tableName,
    };

    await this.dynamoDb.putItem(params).promise();
  }
}
