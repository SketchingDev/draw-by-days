import { IImage } from "image-lib";
import * as React from "react";

export interface ILoadableImage {
    requestState: RequestState;
    image: IImage | null;
}

export enum RequestState {
    Loading,
    Ok,
    Error,
}

export class LoadableImage extends React.PureComponent<ILoadableImage> {
    public render() {
        const {requestState, image} = this.props;
        switch (requestState) {
            case RequestState.Loading:
                return <p>Loading</p>;
            case RequestState.Ok:
                return <img src={image!.path} alt={image!.description} />;
            default:
                return <p>Error loading image</p>;
        }
    }
}
