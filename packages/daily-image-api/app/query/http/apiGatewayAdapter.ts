import { APIGatewayProxyEvent } from "aws-lambda";
import { AppDependencies } from "../AppDependencies";
import { App } from "../app";

const { res } = require("@laconia/event").apigateway;

const domain = "drawbydays.com";
const defaultOrigin = `http://${domain}`;

const withCors = (next: any) => async (event: APIGatewayProxyEvent, ...args: any[]) => {
  const response = await next(event, ...args);

  const origin = event.headers && event.headers.origin;
  const isOriginDrawByDays = origin && origin.endsWith(domain);

  response.headers["Access-Control-Allow-Origin"] = isOriginDrawByDays ? origin : defaultOrigin;

  return response;
};

export const apiGatewayAdapter = (app: App) =>
  withCors(async (_: APIGatewayProxyEvent, dependencies: AppDependencies) => {
    try {
      const output = await app(new Date(), dependencies);
      return res(output);
    } catch (err) {
      console.log(err);
      return res("Unknown error", 500);
    }
  });
