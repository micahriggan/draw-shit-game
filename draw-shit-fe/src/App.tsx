import "semantic-ui-css/semantic.min.css";
import "./App.css";

import { createBrowserHistory } from "history";
import * as React from "react";
import { Route, Router, Switch } from "react-router";

import { DrawShitContainer } from "./containers/draw/draw";
import { JoinRoomContainer } from "./containers/join/join-room";
import { StartContainer } from "./containers/start/start";

const customHistory = createBrowserHistory();

class App extends React.Component {
  public render() {
    return (
      <Router history={customHistory}>
        <Switch>
          <Route exact={true} path="/" component={JoinRoomContainer} />
          <Route exact={true} path="/start/:room" component={StartContainer} />
          <Route
            exact={true}
            path="/draw/:room"
            component={DrawShitContainer}
          />
        </Switch>
      </Router>
    );
  }
}

export default App;
