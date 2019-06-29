import axios, { AxiosInstance } from "axios";

interface IImageResponse {
  id: string;
  url: string;
  date: string;
}

export interface IDailyImage {
  id: string;
  url: string;
  date: Date;
}

export class ImageApiClient {
  private client: AxiosInstance;

  public constructor(endpointUrl: string) {
    this.client = axios.create({ baseURL: endpointUrl });
  }

  public async getImages(): Promise<IDailyImage[]> {
    const url = `/dailyImage`;

    const { data } = await this.client.get<IImageResponse[]>(url);

    return data.map(image => ({ id: image.id, url: image.url, date: new Date(image.date) }));
  }
}
