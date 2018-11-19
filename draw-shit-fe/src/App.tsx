import "semantic-ui-css/semantic.min.css";
import "./App.css";

import { createBrowserHistory } from "history";
import * as React from "react";
import { Route, Router, Switch } from "react-router";

import * as SocketIO from "socket.io-client";
import { DrawShitContainer } from "./containers/draw/draw";
import { JoinRoomContainer } from "./containers/join/join-room";
import { StartContainer } from "./containers/start/start";
import { SocketContext } from "./contexts/SocketContext";
const backendURL = process.env.REACT_APP_BACKEND || "http://localhost:3001";
window.console.log(backendURL);
const Socket = SocketIO(backendURL, { transports: ["websocket"] });

const customHistory = createBrowserHistory();

class App extends React.Component {
  public render() {
    return (
      <SocketContext.Provider value={Socket}>
        <Router history={customHistory}>
          <Switch>
            <Route exact={true} path="/" component={JoinRoomContainer} />
            <Route
              exact={true}
              path="/start/:room?"
              component={StartContainer}
            />
            <Route
              exact={true}
              path="/draw/:room"
              component={DrawShitContainer}
            />
          </Switch>
        </Router>
      </SocketContext.Provider>
    );
  }
}

export default App;
