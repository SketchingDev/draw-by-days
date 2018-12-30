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

type ResultCallback = Callback<{ result: string; message: string } | null>;

export const saveImageDetails = (event: IBasicImageDetails, context: Context, callback: ResultCallback) => {
  const { TABLE_NAME } = process.env;

  const ImageRecord = model<ImageModel, void>(TABLE_NAME!, imageSchema);
  const imageRecord = new ImageRecord(objectMapper(event, imageModelToSchemaMap));

  imageRecord.save().then(
    (imageModel: Model<ImageModel>) => {
      const item = imageModel.originalItem() as ImageModel;
      callback(null, { result: "success", message: `Details saved for ${item.ImageId}` });
    },
    (err: any) => {
      callback(err, undefined);
    },
  );
};
