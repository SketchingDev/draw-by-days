import { Context } from "aws-lambda";
import { ResultCallback } from "aws-types-lib";
import { model, ModelConstructor } from "dynamoose";
import { Model } from "dynamoose";
import { throwIfUndefined } from "middy-middleware-lib";
import { IImage } from "./storage/image";
import { imageSchema } from "./storage/imageSchema";

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

const successResult = (savedItem: Model<IImage>) => {
  const item = savedItem.originalItem() as IImage;
  console.log("Successfully saved", JSON.stringify(item));

  return { result: "success", message: `Details stored for ${item.ImageId}` };
};

export const saveImageState = <T extends { imageId: string }>(
  updateObjectGenerator: (sourceMessage: T) => Partial<IImage>,
) => (message: T, context: Context, callback: ResultCallback) =>
  deps
    .init()
    .then(({ imageRecord }) => {
      const updateObject = updateObjectGenerator(message);
      return imageRecord.update(message.imageId, updateObject);
    })
    .then(image => callback(null, successResult(image)));
