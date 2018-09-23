import { IDailyImage } from "image-lib";
import { getImage } from "./handler/returnImage";

interface IRequest {
    body: string;
    headers: {
        [key: string]: string;
    };
    statusCode: number;
}

const createRequest = (image: IDailyImage): IRequest => {
    if (image == null) {
        return {
            body: "",
            headers: {},
            statusCode: 300,
        };
    }

    return {
    body: JSON.stringify(image),
    headers: {
        "Content-Type": "application/json; charset=utf-8",
    },
    statusCode: 200,
};
};

export const handler = async (event: any) => getImage()
  .then((image) => createRequest(image));
