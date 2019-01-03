import { Callback, Context } from "aws-lambda";
import { model, Model, Schema } from "dynamoose";
import { IBasicImageDetails } from "messages-lib/lib";

// tslint:disable-next-line:no-var-requires
const objectMapper = require("object-mapper");

const imageModelToSchemaMap = {
  imageId: "ImageId",
  description: "Description",
};

export const imageSchema = new Schema({
  ImageId: {
    type: String,
  },
  Description: {
    type: String,
  },
});

export interface ImageModel {
  ImageId: string;
  Description: string;
}

// const getTableName = () => process.env.TABLE_NAME!;
const createImageRecordThing = () => {
  const tableName = process.env.TABLE_NAME!;
  return model<ImageModel, void>(tableName, imageSchema);
};

export const deps = {
  init: () => {
    return Promise.resolve({ imageRecord: createImageRecordThing() });
  },
};
//
// export const deps = {
//   init: () => {
//     return Promise.resolve(getTableName()).then((tableName: string) => ({
//       imageRecord: createImageRecordThing(tableName),
//     }));
//   },
// };

type ResultCallback = Callback<{ result: string; message: string } | null>;

export const saveImageDetails = (event: IBasicImageDetails, context: Context, callback: ResultCallback) =>
  deps
    .init()
    .then(d => new d.imageRecord(objectMapper(event, imageModelToSchemaMap)).save())
    .then(
      (imageModel: Model<ImageModel>) => {
        const item = imageModel.originalItem() as ImageModel;
        callback(null, { result: "success", message: `Details saved for ${item.ImageId}` });
      },
      (err: any) => {
        callback(err, undefined);
      },
    );
