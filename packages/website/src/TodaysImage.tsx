import * as React from "react";
import { Image } from "semantic-ui-react";
import { IDailyImage } from "./@types/dailyImage";

interface IProps {
   date: Date;
}

export class TodaysImage extends React.Component<IProps, {}> {

  private static convertToIsoDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  public render() {
    return (
      <Connect
        query={graphqlOperation(getDailyImageQuery, { date: TodaysImage.convertToIsoDate(this.props.date) })}
      >
        {({
          data: { getDailyImage },
          loading,
          errors,
        }: {
          data: { getDailyImage: IDailyImage[] };
          loading: boolean;
          errors: object[];
        }) => {
          if (errors && errors.length > 0) {
            return <h3>Error</h3>;
          }
          if (loading || !getDailyImage) {
            return <h3>Loading...</h3>;
          }

          if (!getDailyImage) {
            return <h3>No image available yet</h3>
          }

          return (
            <div>
              {getDailyImage.map(image => (
                <Image centered={true} key={image.url} src={image.url} />
              ))}
              Images kindly provided by <a href="https://pixabay.com/">Pixabay</a>.
            </div>
          );
        }}
      </Connect>
    );
  }
}
