import { URL } from "url";
import { saveRemoteFileToS3 } from "../../../app/storage/saveImageToBucket";
import { ingestImage } from "../../../app/ingestImage";

describe("Ingest Image handler", () => {
  let remoteUrlS3Saver: saveRemoteFileToS3;

  beforeEach(() => {
    remoteUrlS3Saver = jest.fn();
  });

  test("Image saved to S3 with safe S3 object key", async () => {
    const getRandomImage = jest.fn().mockResolvedValue({ url: new URL("http://drawbydays.com/test-image.png") });

    await ingestImage({}, { getRandomImage, remoteUrlS3Saver });

    expect(remoteUrlS3Saver).toBeCalledWith(
      new URL("http://drawbydays.com/test-image.png"),
      "drawbydays.com!test-image.png",
    );
  });

  test("When no image is available then nothing saved to S3", async () => {
    const getRandomImage = jest.fn().mockResolvedValue(undefined);

    await ingestImage({}, { getRandomImage, remoteUrlS3Saver });

    expect(remoteUrlS3Saver).toBeCalledTimes(0);
  });
});
