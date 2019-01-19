import { IImageDetails } from "messages-lib";
import { IImage } from "../storage/image";

// tslint:disable-next-line:no-var-requires
const objectMapper = require("object-mapper");

const imageDetailsToImageSchemaMap = {
  imageId: "ImageId",
  description: "Description",
};

export const imageDetailsUpdateObjectGenerator = (imageDetails: IImageDetails): Partial<IImage> => {
  return objectMapper(imageDetails, imageDetailsToImageSchemaMap);
};
