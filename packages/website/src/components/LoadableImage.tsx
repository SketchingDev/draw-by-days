import CircularProgress from "@material-ui/core/CircularProgress";
import * as React from "react";
import { IImage } from "../image/DummyImageApiClient";

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
        const { requestState, image } = this.props;
        switch (requestState) {
            case RequestState.Loading:
                return <CircularProgress id="image-loading" />;
            case RequestState.Ok:
                return <img src={image!.path} alt={image!.description} />;
            default:
                return <div id="image-error">Error loading image</div>;
        }
    }
}
