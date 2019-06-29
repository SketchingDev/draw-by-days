import { HitSelector, LatestImageHit } from "./pixabayGetRandomImageFactory";

export const randomHitSelector: HitSelector = (hits: LatestImageHit[]) => {
  if (hits.length === 0) {
    return undefined;
  }

  const startIndex = 0;
  const endIndex = hits.length - 1;

  const index = Math.floor(Math.random() * (endIndex - startIndex + 1) + startIndex);
  return hits[index];
};
