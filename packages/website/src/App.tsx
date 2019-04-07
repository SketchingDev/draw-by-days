import * as React from "react";
import { Container } from "semantic-ui-react";
import { TodaysImage } from "./TodaysImage";

export class App extends React.Component {
  public render() {
    return (
      <Container className={"App"}>
        <TodaysImage date={new Date()} />
      </Container>
    );
  }
}
