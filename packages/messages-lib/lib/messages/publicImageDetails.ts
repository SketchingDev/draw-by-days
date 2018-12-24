export interface IImageDimensions {
  width: number;
  height: number;
}

export interface IPublicImage {
  publicUrl: string;
  dimensions: IImageDimensions;
}

// TODO Should this only relate to a public image URL being available? If so I should remove the description.
// TODO Otherwise if this just pertains to the details then I should remove the images
export interface IPublicImageDetails {
  description: string;
  images: [IPublicImage];
}
