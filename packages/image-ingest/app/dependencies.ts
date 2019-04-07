import { getRandomImage } from "./image/getRandomImage";
import { saveRemoteFileToS3 } from "./storage/saveImageToBucket";

export interface EnvDependencies {
  pixabayApiKey: string;
  imageStorageBucketName: string;
}

export interface AppDependencies {
  getRandomImage: getRandomImage;
  remoteUrlS3Saver: saveRemoteFileToS3;
}
