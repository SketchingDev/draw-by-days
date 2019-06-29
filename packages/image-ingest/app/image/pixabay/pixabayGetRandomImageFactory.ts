import { ImageRequest } from "pixabay-api/lib/PixabayRequest";
import { ImageHit, ImageResponse } from "pixabay-api/dist/PixabayResponse";
import { URL } from "url";
import { getRandomImage, Image } from "../getRandomImage";

export type searchImages = (
  key: string,
  query: string,
  options?: ImageRequest,
  validate?: boolean,
) => Promise<ImageResponse>;

const allImagesQuery = "";

const randomImagesOptions: ImageRequest = {
  safesearch: true,
  image_type: "photo",
  per_page: 3,
  editors_choice: true,
};

/**
 * Pixabay-api library is out of date and does not contain these properties.
 */
export interface LatestImageHit extends ImageHit {
  largeImageURL: string;
}

interface LatestImageResponse extends ImageResponse {
  hits: LatestImageHit[];
}

export type HitSelector = (hits: LatestImageHit[]) => LatestImageHit | undefined;

const mapEvent = (hit: LatestImageHit): Image => ({
  url: new URL(hit.largeImageURL),
});

export const pixabayGetRandomImageFactory = (
  search: searchImages,
  authKey: string,
  hitSelector: HitSelector,
): getRandomImage => async () => {
  let response;
  try {
    response = (await search(authKey, allImagesQuery, randomImagesOptions)) as LatestImageResponse;
  } catch (err) {
    console.log("Error querying Pixabay", err);
    throw new Error(
      err.response
        ? `Request to Pixabay returned non-2x status code ${err.response.status}`
        : "Request to Pixabay failed",
    );
  }

  if (response.totalHits) {
    const hit = hitSelector(response.hits);
    if (hit) {
      return mapEvent(hit);
    }
  }

  return undefined;
};
