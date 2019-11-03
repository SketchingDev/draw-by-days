import { ReadDailyImages } from "./storage/ReadDailyImages";

export interface AppDependencies {
  dailyImageRepository: ReadDailyImages;
  logger: { log: (message?: any, ...optionalParams: any[]) => void };
}
