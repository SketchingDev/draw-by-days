import * as React from "react";
import { LoadableImage, RequestState } from "./components/LoadableImage";
import { ImageApiClient } from "./dailyImage/DailyImageApiClient";

interface IProps {
   date: Date;
}

export class TodaysImage extends React.Component<IProps, {}> {

  public state = {
    image: null,
    requestState: RequestState.Loading,
  };

  private client = new ImageApiClient(process.env.REACT_APP_DAILY_IMAGE_API_URL!);

  public async componentDidMount() {
    let images;

    try{
      images = await this.client.getImages();
    } catch (error) {
      console.error(error);
      this.setState({ requestState: RequestState.Error, image: null });
      return;
    }

    if (images.length === 0) {
      this.setState({ requestState: RequestState.Unavailable, image: null });
    } else {
      this.setState({ requestState: RequestState.Ok, image: images[0]})
    }
  }

  public render = () => <LoadableImage {...this.state} />;
}
