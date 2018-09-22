// import axios, { AxiosResponse } from "axios";
import { IImage } from "image-models-lib";

export class DummyImageApiClient {

    private static IMAGE_URL: string = "https://www.w3.org/People/mimasa/test/imgformat/img/w3c_home.jpg";

    // private static formatUrl(url: string, date: Date) {
    //     return url + date.toDateString();
    // }

    // public constructor(private endpointUrl: string) {}

    // public async getImage(date: Date): Promise<IImage> {
    //     const url = ImageApiClient.formatUrl(this.endpointUrl, date);

    //     return axios.get(url).then(this.convert);
    // }

    public async getImage(date: Date): Promise<IImage> {
        return Promise.resolve({
            description: "Placeholder whilst we wait to get today's image",
            path: DummyImageApiClient.IMAGE_URL,
        });
    }

    // private convert(response: AxiosResponse<any>): IImage {
    //     return {
    //         description: "",
    //         url: "",
    //     };
    // }
}
