import { handler } from "./main";

test("Response is defined", async () => {
    const response = await handler({});

    expect(JSON.parse(response.body)).toMatchObject({
        image: {
            description: "Hello Worlddd",
            path: "https://www.w3.org/People/mimasa/test/imgformat/img/w3c_home.jpg",
        },
      });

    expect(response.statusCode).toBe(200);
});
