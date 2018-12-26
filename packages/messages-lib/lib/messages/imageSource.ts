export interface IImageDimensions {
  width: number;
  height: number;
}

export interface IImageSource {
  imageId: string;
  publicUrl: string;
  dimensions: IImageDimensions;
}
