import * as React from "react";
import { Container, Header } from "semantic-ui-react";
import { TodaysImage } from "./TodaysImage";

export class App extends React.Component {
  public render() {
    return (
      <Container className={"App"}>
        <Header as='h1' dividing={true}>
          Practice drawing a new image each day!
        </Header>
        <TodaysImage date={new Date()} />
      </Container>
    );
  }
}
