import axios from "axios";
import { URL } from "url";

describe("Integration test Process API", () => {

  it("Calling API returns an image", async () => {
    const startProcessUrl = new URL("/start", process.env.IMAGE_API_URL);

    const { data } = await axios.get(startProcessUrl.toString());

    expect(data.date).toBeDefined();
    expect(data).toMatchObject({
      image: {
          description: "Hello World",
          path: "https://www.w3.org/People/mimasa/test/imgformat/img/w3c_home.jpg",
      },
    });
  });
});
