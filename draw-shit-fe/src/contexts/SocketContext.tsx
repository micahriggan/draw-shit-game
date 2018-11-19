import * as React from "react";
import * as SocketIO from "socket.io-client";
const socket = SocketIO("http://localhost:3001", { transports: ["websocket"] });

export const SocketContext = React.createContext(socket);

export function WithSocket<C extends React.ComponentClass>(Component: C): C {
  return ((props => (
    <SocketContext.Consumer>
      {io => <Component {...props} socket={io} />}
    </SocketContext.Consumer>
  )) as any) as C;
}
