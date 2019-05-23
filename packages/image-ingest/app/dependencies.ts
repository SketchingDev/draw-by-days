import { getRandomImage } from "./image/getRandomImage";
import { saveRemoteFileToS3 } from "./storage/saveImageToBucket";

export interface EnvDependencies {
  PIXABAY_API_KEY: string;
  IMAGE_STORAGE_BUCKET_NAME: string;
}

export interface AppDependencies {
  getRandomImage: getRandomImage;
  remoteUrlS3Saver: saveRemoteFileToS3;
}
