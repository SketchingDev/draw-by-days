import { APIGatewayProxyEvent } from "aws-lambda";
import { AppDependencies } from "../AppDependencies";
import { App } from "../app";

const { res } = require("@laconia/event").apigateway;

// https://github.com/laconiajs/laconia/blob/6af929d1dc227e59b2f8094b38b7dd5e7cd78434/packages/laconia-acceptance-test/src/accept-order.js
const withCors = (next: any) => async (...args: any[]) => {
  const response = await next(...args);
  // TODO Update wildcard to be host in request, so long as it matches *.drawbydays.com
  response.headers["Access-Control-Allow-Origin"] = "*";
  return response;
};

export const apiGatewayAdapter = (app: App) =>
  withCors(async (_: APIGatewayProxyEvent, dependencies: AppDependencies) => {
    console.log(_);
    try {
      const output = await app(new Date(), dependencies);
      return res(output);
    } catch (err) {
      console.log(err);
      return res("Unknown error", 500);
    }
  });
