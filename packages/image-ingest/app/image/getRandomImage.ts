import { URL } from "url";

export interface Image {
  url: URL;
}

export type getRandomImage = () => Promise<Image | undefined>;
