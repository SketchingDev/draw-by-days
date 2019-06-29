import { ReadDailyImages } from "./storage/ReadDailyImages";

export interface AppDependencies {
  dailyImageRepository: ReadDailyImages;
}
