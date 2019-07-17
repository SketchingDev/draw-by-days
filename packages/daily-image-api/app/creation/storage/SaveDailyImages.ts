import { DailyImage } from "../../domain/DailyImage";

export interface SaveDailyImages {
  saveAll(dailyImages: DailyImage[]): Promise<void>;
}
