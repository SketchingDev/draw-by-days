import { Callback, Context } from "aws-lambda";
import { format } from "date-fns";
import { model, Model, Schema } from "dynamoose";
import { IPublicImageDetails } from "messages-lib/lib";

// tslint:disable-next-line:no-var-requires
const objectMapper = require("object-mapper");

const imageModelToSchemaMap = {
  dateId: { key: "DateId", default: () => format(Date.now(), "YYYY-MM-DD") },
  description: "Description",
  "images[].publicUrl": "Images[].PublicUrl",
  "images[].dimensions.width": "Images[].Dimensions.Width",
  "images[].dimensions.height": "Images[].Dimensions.Height",
};

export const imageSchema = new Schema({
  DateId: {
    type: String,
  },
  Description: {
    type: String,
    default: "",
  },
  Images: {
    type: "list",
    list: [
      {
        PublicUrl: {
          type: String,
        },
        Dimensions: {
          type: "map",
          map: {
            Width: {
              type: Number,
            },
            Height: {
              type: Number,
            },
          },
        },
      },
    ],
  },
});

export interface ImageModel {
  DateId: string;
  Description: string;
  Images: {
    PublicUrl: string;
    Dimensions: {
      Width: string;
      Height: string;
    };
  };
}

type ResultCallback = Callback<{ result: string; message: string } | null>;

const tableNameMissingError = "TABLE_NAME environment variable is not defined";

export const saveImageDetails = (event: IPublicImageDetails, context: Context, callback: ResultCallback) => {
  // TODO Will the variable change per container or per invocation?
  const { TABLE_NAME } = process.env;
  if (!TABLE_NAME) {
    // tslint:disable-next-line:no-console
    console.log(tableNameMissingError);
    callback(tableNameMissingError, undefined);
    return;
  }

  // TODO Depending on the answer to the above question this could be moved out of the handler
  const ImageRecord = model<ImageModel, void>(TABLE_NAME, imageSchema);

  const imageRecord = new ImageRecord(objectMapper(event, imageModelToSchemaMap));

  imageRecord.save().then(
    (imageModel: Model<ImageModel>) => {
      const item = imageModel.originalItem() as ImageModel;
      callback(null, { result: "success", message: `Details saved for ${item.DateId}` });
    },
    (err: any) => {
      callback(err, undefined);
    },
  );
};
