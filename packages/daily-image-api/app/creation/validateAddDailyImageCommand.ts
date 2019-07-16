import { URL } from "url";
import { IAddDailyImageCommand } from "draw-by-days-models/lib";
import { DailyImage } from "../domain/DailyImage";

type App<T> = (dailyImages: DailyImage[], context: { [key: string]: any }) => T;
type Context = { [key: string]: any };

export const validateAddDailyImageCommand = <T>(app: App<T>) => async (
  messages: IAddDailyImageCommand[],
  context: Context,
): Promise<T> => {
  const dailyImages: DailyImage[] = [];

  console.log(messages);

  messages.forEach(message => {
    const id = message.id;
    if (!id) {
      throw new Error("Command must contain an ID");
    }

    let url;
    try {
      url = new URL(message.url);
    } catch (err) {
      throw new Error(`Command contains the invalid url '${message.url}': ${err.message}`);
    }

    dailyImages.push({ id, url });
  });

  return await app(dailyImages, context);
};
