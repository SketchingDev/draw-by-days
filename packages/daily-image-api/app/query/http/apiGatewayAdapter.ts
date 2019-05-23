import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { AppDependencies } from "../AppDependencies";
import { App } from "../app";
const { res } = require("@laconia/event").apigateway;

export const apiGatewayAdapter = (app: App) => async (
  _: APIGatewayProxyEvent,
  dependencies: AppDependencies,
): Promise<APIGatewayProxyResult> => {
  try {
    const output = await app(new Date(), dependencies);
    return res(output);
  } catch (err) {
    console.log(err);
    return res("Unknown error", 500);
  }
};
