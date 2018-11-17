import * as React from "react";
import { RouteComponentProps } from "react-router";
import {
  Button,
  Card,
  Dimmer,
  Image,
  List,
  Loader,
  Segment
} from "semantic-ui-react";
import draw from "../../drawshit.png";

interface State {
  roomCode: string;
  started: boolean;
  players: string[];
}
export class StartContainer extends React.Component<
  RouteComponentProps<{ room: string }>,
  State
> {
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
    this.setState({ roomCode: this.props.match.params.room });
  }

  public handleJoinClick() {
    this.props.history.push(`/draw/${this.state.roomCode}`);
  }

  public render() {
    return (
      <Card style={{ margin: "0 auto", marginTop: "25px" }}>
        <Image src={draw} />
        <Card.Content>
          <Card.Header>Draw Shit</Card.Header>
          <Card.Meta>
            <span>Wait.. What is this shit? </span>
          </Card.Meta>
          <Card.Description>
            Get ready to draw some wild shit! Draw Shit is a terrible game made
            while drunk after playing another terrible drawing game with real
            paper
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
