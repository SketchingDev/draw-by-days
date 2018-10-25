import { IDailyImage } from "image-lib";
import { getImage } from "./handler/returnImage";

interface IRequest {
    body: string;
    headers: {
        [key: string]: string;
    };
    statusCode: number;
}

const createRequest = (image: IDailyImage): IRequest => ({
    body: JSON.stringify(image),
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json; charset=utf-8",
    },
    statusCode: 200,
});

export const handler = async (event: any) => getImage()
  .then((image) => createRequest(image));
