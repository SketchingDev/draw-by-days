interface IImage {
    path: string;
    description: string;
}

export interface IDailyImage {
    date: string;
    image: IImage;
}

export const getImage = async (): Promise<IDailyImage> => Promise.resolve({
    date: new Date(Date.now()).toLocaleString(),
    image: {
        description: "W3C image",
        path: "https://www.w3.org/People/mimasa/test/imgformat/img/w3c_home.jpg",
    },
});
