import * as React from "react";
import { Image, Loader } from "semantic-ui-react";
import { URL } from "url";

export interface IAbcImage {
  url: URL;
}

export interface ILoadableImage {
  requestState: RequestState;
  image: IAbcImage | null;
}

export enum RequestState {
  Loading,
  Ok,
  Error,
  Unavailable
}

export class LoadableImage extends React.PureComponent<ILoadableImage> {
  public render() {
    const { requestState, image } = this.props;

    switch (requestState) {
      case RequestState.Loading:
        return <Loader />;
      case RequestState.Ok:
        return <div>
          <Image src={image!.url} fluid={true} />
          <div style={{textAlign: "right"}}>Image provided by <a href={"https://pixabay.com/"}>Pixabay</a></div>
        </div>;
      case RequestState.Unavailable:
        return <p style={{ textAlign: "center"}}>Image isn't available yet, please try again later</p>;
      default:
        return <div id="image-error">Error loading image</div>;
    }
  }
}
