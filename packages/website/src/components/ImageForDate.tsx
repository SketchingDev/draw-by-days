/// <reference types="node" />

import * as React from "react";
import { ILoadableImage, LoadableImage, RequestState } from "website/src/components/LoadableImage";
import { ImageApiClient } from "website/src/image/DummyImageApiClient";

interface IProperties {
    date: Date;
}

export class ImageForDate extends React.Component<IProperties, ILoadableImage> {

    public client = new ImageApiClient(process.env.REACT_APP_IMAGE_API_URL!);
    public state = {
        image: null,
        requestState: RequestState.Loading,
    };

    public async componentDidMount() {
        try {
            this.setState({
                image: await this.client.getImage(this.props.date),
                requestState: RequestState.Ok,
            });
        } catch (error) {
            this.setState({
                image: null,
                requestState: RequestState.Error,
            });
        }
    }

    public render = () => <LoadableImage {...this.state} />;
}
