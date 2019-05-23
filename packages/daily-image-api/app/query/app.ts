import { AppDependencies } from "./AppDependencies";
import { DailyImage } from "../DailyImage";

export type App = (date: Date, dependencies: AppDependencies) => Promise<DailyImage[]>;

export const app: App = async (date: Date, { dailyImageRepository }: AppDependencies): Promise<DailyImage[]> => {
  const abc = await dailyImageRepository.getByDate(date);
  console.log(abc);
  return abc;
};
