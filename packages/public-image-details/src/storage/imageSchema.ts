import { Schema } from "dynamoose";

const imageAttributes = {
  ImageId: {
    type: String,
  },
  Description: {
    type: String,
  },
};

export const imageSchema = new Schema(imageAttributes);
