import { validateAddDailyImageCommand } from "../../../../app/creation/validateAddDailyImageCommand"
import { IAddDailyImageCommand } from "draw-by-days-models/lib";

describe("validateDailyImageCommand", () => {
  test("Function should error if message is missing an id", () => {
    const appStub = jest.fn();
    const messages: IAddDailyImageCommand[] = [{ id: "", url: "https://example.com" }];

    expect(validateAddDailyImageCommand(appStub)(messages, {}))
      .rejects.toEqual(new Error("Command must contain an ID"));
  });

  test("Function should error if message has malformed url", () => {
    const appStub = jest.fn();
    const messages: IAddDailyImageCommand[] = [{ id: "testId", url: "this-is-not-a-url" }];
    const expectedError = new Error(`Command contains the invalid url '${messages[0].url}': Invalid URL: ${messages[0].url}`)

    expect(validateAddDailyImageCommand(appStub)(messages, {}))
      .rejects.toEqual(expectedError);
  });
});
