import { AppDependencies } from "./AppDependencies";
import { DailyImage } from "../DailyImage";

export type App = (dailyImages: DailyImage[], dependencies: AppDependencies) => Promise<void>;

export const app: App = async (dailyImages: DailyImage[], { saveDailyImages }: AppDependencies): Promise<void> =>
  await saveDailyImages.saveAll(dailyImages);
