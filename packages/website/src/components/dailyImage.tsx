import * as React from "react";
import { DummyImageApiClient, IImage } from "../image/imageApiClient";

interface IProperties {
    date: Date;
}

interface IState {
    image: IImage;
}

export class DailyImage extends React.Component<IProperties, IState> {

    // TODO Get from config
    private static IMAGE_API_URL = "http://example.com/";
    private static IMAGE_PLACEHOLDER = "https://via.placeholder.com/350x150";
    private static IMAGE_ERROR = "https://via.placeholder.com/350x750";

    public state = {
        image: {
            description: "Placeholder whilst we wait to get today's image",
            url: DailyImage.IMAGE_PLACEHOLDER,
        },
    };

    // TODO Investigate how to separate concerns
    private client = new DummyImageApiClient(DailyImage.IMAGE_API_URL);

    public async componentDidMount() {
        try {
            const image = await this.client.getImage(this.props.date);
            this.setState({ image });
        } catch (error) {
            this.setState({ image: {
                description: "Error",
                url: DailyImage.IMAGE_ERROR,
            } });
        }
    }

    public render() {
        return <img src={this.state.image.url} />;
    }
}
