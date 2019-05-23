import { DailyImage } from "./domain/dailyImage";

export interface DailyImageRepository {
  saveAll(dailyImages: DailyImage[]): Promise<Array<DailyImage>>;
}
