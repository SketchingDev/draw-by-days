import { DailyImage } from "../../domain/DailyImage";

export interface ReadDailyImages {
  getByDate(date: Date): Promise<DailyImage[]>;
}
