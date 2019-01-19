import { IImageSource } from "messages-lib";
import { IImage } from "../storage/image";

// tslint:disable-next-line:no-var-requires
const objectMapper = require("object-mapper");

const imageSourceToImageSchemaMap = {
  imageId: "ImageId",
  publicUrl: "PublicUrl",
};

export const imageSourceUpdateObjectGenerator = (imageDetails: IImageSource): Partial<IImage> => {
  return objectMapper(imageDetails, imageSourceToImageSchemaMap);
};
