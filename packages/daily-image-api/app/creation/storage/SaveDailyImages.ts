import { DailyImage } from "draw-by-days-models/lib";

export interface SaveDailyImages {
  saveAll(dailyImages: DailyImage[]): Promise<void>;
}
