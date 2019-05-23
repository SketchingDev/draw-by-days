import { URL } from "url";
import { DailyImage } from "../DailyImage";

export interface DailyImageAddedMessage {
  id?: string;
  url?: string;
  date?: string;
}

type App<T> = (dailyImages: DailyImage[], context: { [key: string]: any }) => T;
type Context = { [key: string]: any };

export const validateDailyImageAddedMessage = <T>(app: App<T>) => async (
  messages: DailyImageAddedMessage[],
  context: Context,
): Promise<T> => {
  const dailyImages: DailyImage[] = [];

  console.log(messages);

  messages.forEach(message => {
    const id = message.id;
    if (!id) {
      throw new Error("Message must contain an ID");
    }

    let date;
    try {
      date = new Date(message.date!);
    } catch (err) {
      throw new Error(`Message contains the invalid date '${message.date}': ${err.message}`);
    }

    let url;
    try {
      url = new URL(message.url!);
    } catch (err) {
      throw new Error(`Message contains the invalid url '${message.url}': ${err.message}`);
    }

    dailyImages.push({ id, date, url });
  });

  return await app(dailyImages, context);
};
