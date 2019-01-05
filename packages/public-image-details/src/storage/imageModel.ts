import { Model } from "dynamoose";
import { IImage } from "./image";

export interface IImageModel {
  new (value?: any): { save: () => Promise<Model<IImage>> };
}
