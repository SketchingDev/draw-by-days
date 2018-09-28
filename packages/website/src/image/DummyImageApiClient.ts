import axios, { AxiosInstance } from "axios";
import { format } from "date-fns";
import { IImage } from "image-lib";

interface IResponse {
    date: string;
    image: IImage;
}

export class ImageApiClient {

    private client: AxiosInstance;

    public constructor(endpointUrl: string) {
        this.client = axios.create({ baseURL: endpointUrl });
    }

    public async getImage(date: Date): Promise<IImage> {
        const url = `/images/${format(date, "MMDDYYYY")}`;

        const { data } = await this.client.get(url);
        return (data as IResponse).image;
    }
}
