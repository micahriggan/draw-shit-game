import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Button, Card, Header, Image, Input } from "semantic-ui-react";
import draw from "../../drawshit.png";

interface State {
  roomCode: string;
  joined: boolean;
}
export class JoinRoomContainer extends React.Component<
  RouteComponentProps,
  State
> {
  public state: State = {
    joined: false,
    roomCode: ""
  };
  constructor(props) {
    super(props);
    this.handleJoinClick = this.handleJoinClick.bind(this);
    this.handleUpdateRoomCode = this.handleUpdateRoomCode.bind(this);
  }

  public handleUpdateRoomCode(event: React.FormEvent<HTMLInputElement>) {
    this.setState({ roomCode: event.currentTarget.value });
  }
  public handleJoinClick() {
    this.props.history.push(`/draw/${this.state.roomCode}`);
  }

  public handleRequestNewRoom() {
    this.props.history.push(`/start/${this.state.roomCode}`);
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
            <Input
              value={this.state.roomCode}
              onChange={this.handleUpdateRoomCode}
              placeholder="Room Code..."
              action={
                <Button primary={true} onClick={this.handleJoinClick}>
                  Join
                </Button>
              }
            />
            <Header as="h3">OR</Header>
            <Button primary={true}>Create Game</Button>
          </div>
        </Card.Content>
      </Card>
    );
  }
}
