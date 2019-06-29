import { apiGatewayAdapter } from "../../../../../app/query/http/apiGatewayAdapter";

describe("API Gateway API", () => {
  const app: any = () => {};

  it.each([
    ["http://dev.drawbydays.com", "http://dev.drawbydays.com"],
    ["http://test.drawbydays.com", "http://test.drawbydays.com"],
    ["http://component.drawbydays.com", "http://component.drawbydays.com"],
    ["http://example.test", "http://drawbydays.com"],
    [undefined, "http://drawbydays.com"],
  ])(
    "Request origin %s should have response origin header %s",
    async (requestOrigin: string, responseAccessControlAllowOrigin: string) => {
      const request: any = { headers: { origin: requestOrigin } };
      const expectedResponse = {
        headers: {
          "Access-Control-Allow-Origin": responseAccessControlAllowOrigin,
        },
      };

      const actualResponse = await apiGatewayAdapter(app)(request);
      expect(actualResponse).toMatchObject(expectedResponse);
    },
  );

  it.each([
    {},
    { header: null },
    { header: undefined },
    { header: {} },
    { header: { origin: null } },
    { header: { origin: undefined } },
    { header: { origin: {} } },
  ])("%s defaults to http://drawbydays.com", async (request: any) => {
    const expectedResponse = {
      headers: {
        "Access-Control-Allow-Origin": "http://drawbydays.com",
      },
    };

    const actualResponse = await apiGatewayAdapter(app)(request);
    expect(actualResponse).toMatchObject(expectedResponse);
  });
});
