import { DailyImage } from "draw-by-days-models/lib";

export interface ReadDailyImages {
  getByDate(date: Date): Promise<DailyImage[]>;
}
