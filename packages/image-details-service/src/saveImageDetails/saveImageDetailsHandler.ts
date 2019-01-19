import { Context } from "aws-lambda";
import { ResultCallback } from "aws-types-lib";
import { model, Model, ModelConstructor } from "dynamoose";
import { IImageDetails } from "messages-lib/lib/messages/imageDetails";
import { throwIfUndefined } from "middy-middleware-lib";
import { IImage } from "../storage/image";
import { imageSchema } from "../storage/imageSchema";
import { imageDetailsToImageSchemaMap } from "./imageDetailsToImageSchemaMap";

// tslint:disable-next-line:no-var-requires
const objectMapper = require("object-mapper");

export interface IDeps {
  imageRecord: ModelConstructor<IImage, string>;
}
export const deps = {
  init: (): Promise<IDeps> =>
    Promise.resolve({
      imageRecord: model<IImage, string>(
        throwIfUndefined(process.env.TABLE_NAME, "TABLE_NAME environment variable not set"),
        imageSchema,
      ),
    }),
};

const saveImageDetails = (imageRecord: ModelConstructor<IImage, string>, imageDetails: IImageDetails) => {
  const dbImage: IImage = objectMapper(imageDetails, imageDetailsToImageSchemaMap);
  return imageRecord.update(dbImage.ImageId, { Description: dbImage.Description });
};

const successResult = (savedItem: Model<IImage>) => {
  const item = savedItem.originalItem() as IImage;
  console.log("Successfully saved", JSON.stringify(item));

  return { result: "success", message: `Details stored for ${item.ImageId}` };
};

const failedResult = (err: any) => {
  console.log("Failed to save item", JSON.stringify(err));
  return err;
};

export const saveImageDetailsHandler = (imageDetails: IImageDetails, context: Context, callback: ResultCallback) =>
  deps
    .init()
    .then(({ imageRecord }) => saveImageDetails(imageRecord, imageDetails))
    .then(image => callback(null, successResult(image)), (err: any) => callback(failedResult(err), undefined));
