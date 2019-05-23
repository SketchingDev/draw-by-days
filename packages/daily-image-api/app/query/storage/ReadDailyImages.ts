import { DailyImage } from "../../DailyImage";

export interface ReadDailyImages {
  getByDate(date: Date): Promise<DailyImage[]>;
}
