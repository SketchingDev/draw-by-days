import { ImageResponse } from "pixabay-api/dist/PixabayResponse";
import { URL } from "url";
import { pixabayGetRandomImageFactory } from "../../../../app/image/pixabay/pixabayGetRandomImageFactory";

describe("Pixabay Random Image", () => {
  const emptyAuthKey = "";

  const createHit = (largeImageURL: string) => ({
    largeImageURL: largeImageURL,
    webformatHeight: 0,
    webformatWidth: 0,
    likes: 0,
    imageWidth: 0,
    id: 0,
    user_id: 0,
    views: 0,
    comments: 0,
    pageURL: "",
    imageHeight: 0,
    webformatURL: "",
    type: "",
    previewHeight: 0,
    tags: "",
    downloads: 0,
    user: "",
    favorites: 0,
    imageSize: 0,
    previewWidth: 0,
    userImageURL: "",
    previewURL: "",
  });

  test("First hit returned if multiple returned from API", async () => {
    const pixabayResponse = {
      totalHits: 3,
      total: 3,
      hits: [
        createHit("https://pixabay.test/dummy-image1.jpg"),
        createHit("https://pixabay.test/dummy-image2.jpg"),
        createHit("https://pixabay.test/dummy-image3.jpg"),
      ],
    } as any;

    const mockSearchImages = jest.fn().mockResolvedValue(pixabayResponse);
    const response = await pixabayGetRandomImageFactory(mockSearchImages, emptyAuthKey, (hits: any) => hits[0])();

    expect(response).toMatchObject({
      url: new URL("https://pixabay.test/dummy-image1.jpg"),
    });
  });

  test("Undefined returned if no hits from API", async () => {
    const emptyPixabayResponse: ImageResponse = {
      totalHits: 0,
      total: 0,
      hits: [],
    };

    const mockSearchImages = jest.fn().mockResolvedValue(emptyPixabayResponse);
    const response = await pixabayGetRandomImageFactory(mockSearchImages, emptyAuthKey, () => undefined)();

    expect(response).toBeUndefined();
  });
});
