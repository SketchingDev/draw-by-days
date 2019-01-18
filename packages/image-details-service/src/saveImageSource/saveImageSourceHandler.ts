import { Context } from "aws-lambda";
import { ResultCallback } from "aws-types-lib";
import { model, Model } from "dynamoose";
import { IImageSource } from "messages-lib";
import { throwIfUndefined } from "middy-middleware-lib";
import { IImage } from "../storage/image";
import { IImageModel } from "../storage/imageModel";
import { imageSchema } from "../storage/imageSchema";
import { imageSourceToImageSchemaMap } from "./imageSourceToImageSchemaMap";

// tslint:disable-next-line:no-var-requires
const objectMapper = require("object-mapper");

export interface IDeps {
  imageRecord: IImageModel;
}
export const deps = {
  init: (): Promise<IDeps> =>
    Promise.resolve({
      imageRecord: model<IImage, void>(
        throwIfUndefined(process.env.TABLE_NAME, "TABLE_NAME environment variable not set"),
        imageSchema,
      ),
    }),
};

const saveImageSource = (imageRecord: IImageModel, imageSource: IImageSource) => {
  const mappedObject = objectMapper(imageSource, imageSourceToImageSchemaMap);
  return new imageRecord(mappedObject).save();
};

const successResult = (savedItem: Model<IImage>) => {
  const item = savedItem.originalItem() as IImage;
  return { result: "success", message: `URL ${item.PublicUrl} saved for ${item.ImageId}` };
};

export const saveImageSourceHandler = (imageSource: IImageSource, context: Context, callback: ResultCallback) =>
  deps
    .init()
    .then(({ imageRecord }) => saveImageSource(imageRecord, imageSource))
    .then(image => callback(null, successResult(image)), (err: any) => callback(err, undefined));
