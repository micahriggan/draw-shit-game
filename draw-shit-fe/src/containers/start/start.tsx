import * as React from "react";
import { RouteComponentProps } from "react-router";
import {
  Button,
  Card,
  Dimmer,
  Header,
  Image,
  List,
  Loader,
  Segment
} from "semantic-ui-react";
import * as SocketIO from "socket.io-client";
import { WithSocket } from "../../contexts/SocketContext";
import draw from "../../drawshit.png";

interface State {
  roomCode: string;
  started: boolean;
  players: string[];
}
interface Props extends RouteComponentProps<{ room: string }> {
  socket: typeof SocketIO.Socket;
}

@WithSocket
export class StartContainer extends React.Component<Props, State> {
  public state: State = {
    players: [],
    roomCode: "",
    started: false
  };
  constructor(props) {
    super(props);
    this.handleJoinClick = this.handleJoinClick.bind(this);
  }

  public componentDidMount() {
    const paramRoom = this.props.match.params.room;
    if (!paramRoom) {
      this.props.socket.emit("room:create");
      this.props.socket.on("room:created", room => {
        this.props.history.push(`/start/${room}`);
        this.joinRoom(room);
      });
    } else {
      this.joinRoom(paramRoom);
    }
  }

  public componentWillUnmount() {
    this.props.socket.removeListener("room:created");
    this.props.socket.removeListener("room:joined");
  }

  public joinRoom(roomCode: string) {
    window.console.log("joining room", roomCode);
    this.props.socket.emit("room:subscribe", roomCode);
    this.setState({ roomCode });
    this.props.socket.on("room:joined", player => {
      window.console.log("player joined", player);
      this.setState({ players: this.state.players.concat([player]) });
    });
  }

  public handleJoinClick() {
    this.props.socket.emit("room:start", this.state.roomCode);
    this.props.history.push(`/draw/${this.state.roomCode}`);
  }

  public render() {
    return (
      <Card
        style={{ margin: "0 auto", marginTop: "25px", textAlign: "center" }}
      >
        <Image src={draw} />
        <Card.Content>
          <Card.Header>Draw Shit</Card.Header>
          <Card.Meta>
            <span>New Room...</span>
          </Card.Meta>
          <Card.Description>
            <Header>{this.state.roomCode}</Header>
          </Card.Description>
        </Card.Content>
        <Card.Content extra={true} style={{ textAlign: "center" }}>
          <div>
            <List items={this.state.players} />
            {this.state.players.length < 1 ? (
              <Segment style={{ height: "150px" }}>
                <Dimmer active={true}>
                  <Loader>Waiting for more players</Loader>
                </Dimmer>
              </Segment>
            ) : null}
            <Button primary={true} onClick={this.handleJoinClick}>
              "We're All Here"
            </Button>
          </div>
        </Card.Content>
      </Card>
    );
  }
}
