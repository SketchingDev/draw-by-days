import { AppDependencies } from "./AppDependencies";
import { DailyImage } from "../domain/DailyImage";

export type App = (date: Date, dependencies: AppDependencies) => Promise<DailyImage[]>;

export const app: App = async (date: Date, { dailyImageRepository }: AppDependencies): Promise<DailyImage[]> =>
  await dailyImageRepository.getByDate(date);
