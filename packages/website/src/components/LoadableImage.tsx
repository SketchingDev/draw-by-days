import CircularProgress from "@material-ui/core/CircularProgress";
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
