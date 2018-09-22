import { IDailyImage } from "image-models-lib";

export const getImage = async (): Promise<IDailyImage> => Promise.resolve({
    date: new Date(Date.now()).toLocaleString(),
    image: {
        description: "Hello Worlddd",
        path: "https://www.w3.org/People/mimasa/test/imgformat/img/w3c_home.jpg",
    },
});
