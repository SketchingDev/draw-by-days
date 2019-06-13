import { DailyImage } from "draw-by-days-models/lib";

export interface DailyImageRepository {
  saveAll(dailyImages: DailyImage[]): Promise<Array<DailyImage>>;
}
