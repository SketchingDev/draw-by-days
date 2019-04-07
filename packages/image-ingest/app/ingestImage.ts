import { AppDependencies } from "./dependencies";
import filenamifyUrl from "filenamify-url";
import { Image } from "./image/getRandomImage";

const createKey = (image: Image) => filenamifyUrl(image.url.toString());

export const ingestImage = async (_: any, { remoteUrlS3Saver, getRandomImage }: AppDependencies) => {
  const image = await getRandomImage();
  if (!image) {
  } else {
    const objectKey = createKey(image);

    console.log("Saving random image", { image, objectKey });
    await remoteUrlS3Saver(image.url, objectKey);
  }
};
