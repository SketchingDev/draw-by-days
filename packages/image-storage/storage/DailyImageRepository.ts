import { Image } from "./domain/image";

export interface DailyImageRepository {
  saveAll(images: Image[]): Promise<Array<Image>>;
}
