import { Context } from "aws-lambda";
import { ResultCallback } from "aws-types-lib";
import { model, Model, ModelConstructor } from "dynamoose";
import { IImageSource } from "messages-lib";
import { throwIfUndefined } from "middy-middleware-lib";
import { IImage } from "../storage/image";
import { imageSchema } from "../storage/imageSchema";
import { imageSourceToImageSchemaMap } from "./imageSourceToImageSchemaMap";

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

const saveImageSource = (imageRecord: ModelConstructor<IImage, string>, imageSource: IImageSource) => {
  const dbImage: IImage = objectMapper(imageSource, imageSourceToImageSchemaMap);
  return imageRecord.update(dbImage.ImageId, { PublicUrl: dbImage.PublicUrl });
};

const successResult = (savedItem: Model<IImage>) => {
  const item = savedItem.originalItem() as IImage;
  console.log("Successfully saved", JSON.stringify(item));

  return { result: "success", message: `Source stored for ${item.ImageId}` };
};

const failedResult = (err: any) => {
  console.log("Failed to save item", JSON.stringify(err));
  return err;
};

export const saveImageSourceHandler = (imageSource: IImageSource, context: Context, callback: ResultCallback) =>
  deps
    .init()
    .then(({ imageRecord }) => saveImageSource(imageRecord, imageSource))
    .then(image => callback(null, successResult(image)), (err: any) => callback(failedResult(err), undefined));
