import { DailyImage } from "../../DailyImage";

export interface SaveDailyImages {
  saveAll(dailyImages: DailyImage[]): Promise<void>;
}
