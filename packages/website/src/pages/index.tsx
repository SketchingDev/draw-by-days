import AppBar from "@material-ui/core/AppBar";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import createStyles from "@material-ui/core/styles/createStyles";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import * as React from "react";
import { ImageForDate } from "website/src/components/ImageForDate";
import withRoot from "../withRoot";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      paddingTop: theme.spacing.unit * 20,
      textAlign: "center",
    },
  });

interface IState {
  open: boolean;
}

class Index extends React.Component<WithStyles<typeof styles>, IState> {

  private todaysDate = new Date();

  public render() {
    return (
      <div className={this.props.classes.root}>
        <React.Fragment>
          <AppBar position="absolute" color="default">
            <Toolbar>
              <Typography variant="title" color="inherit" noWrap={true}>
                Draw by Days
              </Typography>
            </Toolbar>
          </AppBar>
          <ImageForDate date={this.todaysDate} />
        </React.Fragment>
      </div>
    );
  }
}

export default withRoot(withStyles(styles)(Index));
