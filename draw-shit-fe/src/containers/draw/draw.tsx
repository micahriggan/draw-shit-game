import * as React from "react";
import { RouteComponentProps } from "react-router";
import { SketchField, Tools } from "react-sketch";
import {
  Button,
  Dimmer,
  Header,
  Icon,
  Image,
  Input,
  Loader,
  Placeholder
} from "semantic-ui-react";
import { WithSocket } from "../../contexts/SocketContext";

import * as SocketIO from "socket.io-client";

export interface Challenge {
  type: "image" | "phrase";
  payload: string;
  id: string;
}

interface Props extends RouteComponentProps<{ room: string }> {
  socket: typeof SocketIO.Socket;
}
interface State {
  width: number;
  height: number;
  currentIndex: number;
  roomCode: string;
  pending: Challenge[];
  attempt?: Challenge;
}

@WithSocket
export class DrawShitContainer extends React.Component<Props, State> {
  public state: State = {
    width: window.innerWidth,
    height: window.innerHeight,
    attempt: undefined,
    currentIndex: 0,
    pending: [],
    roomCode: ""
  };

  private sketch: {
    redo: () => void;
    undo: () => void;
    toDataURL: () => string;
  };
  constructor(props) {
    super(props);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.handleUndoClick = this.handleUndoClick.bind(this);
    this.handleRedoClick = this.handleRedoClick.bind(this);
    this.handleGuessTextUpdate = this.handleGuessTextUpdate.bind(this);
    this.handleSubmissionClick = this.handleSubmissionClick.bind(this);
    this.handleImageSubmissionClick = this.handleImageSubmissionClick.bind(
      this
    );
    this.currentState = this.currentState.bind(this);
  }

  public componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);

    const roomCode = this.props.match.params.room;
    this.setState({ roomCode });
    window.console.log("joining room", roomCode);
    this.props.socket.emit("room:join", roomCode);
    this.props.socket.on("challenge", (challenge: Challenge) => {
      window.console.log(challenge);
      this.setState({ pending: this.state.pending.concat([challenge]) });
    });
  }

  public componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
  }

  public updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  public handleUndoClick() {
    this.sketch.undo();
  }

  public handleRedoClick() {
    this.sketch.redo();
  }

  public drawPictureComponent(toGuess: Challenge) {
    const width = window.innerWidth + "px";
    const height = window.innerHeight - 250 + "px";
    return (
      <div>
        <Icon
          size="huge"
          name="save"
          onClick={this.handleImageSubmissionClick}
        />
        <Header as="h2">Draw: {toGuess.payload}</Header>

        <SketchField
          ref={c => (this.sketch = c)}
          width={width}
          height={height}
          tool={Tools.Pencil}
          lineColor="black"
          lineWidth={3}
        />
        <Icon size="huge" name="undo" onClick={this.handleUndoClick} />
        <Icon size="huge" name="redo" onClick={this.handleRedoClick} />
      </div>
    );
  }

  public currentState() {
    return this.state.pending[this.state.currentIndex];
  }

  public handleGuessTextUpdate(event: React.FormEvent<HTMLInputElement>) {
    const { type, id } = this.currentState();
    this.setState({
      attempt: {
        type,
        id,
        payload: event.currentTarget.value
      }
    });
  }

  public async handleImageSubmissionClick() {
    const { type, id } = this.currentState();
    const attempt = { type, payload: this.sketch.toDataURL(), id };
    window.console.log(attempt);
    await this.setState({ attempt });
    this.handleSubmissionClick();
  }

  public handleSubmissionClick() {
    const attempt = this.state.attempt;
    window.console.log("attempt", attempt);
    this.props.socket.emit("submission", attempt);
    this.setState({
      currentIndex: this.state.currentIndex + 1,
      attempt: undefined
    });
  }

  public guessPictureComponent(toGuess: Challenge) {
    const currentValue = this.state.attempt ? this.state.attempt.payload : "";

    return (
      <div>
        <Image src={toGuess.payload}/>
        <Header as="h2">WTF Is it</Header>
        <Input
          onChange={this.handleGuessTextUpdate}
          value={currentValue}
          action={
            <Button primary={true} onClick={this.handleSubmissionClick}>
              I got this...
            </Button>
          }
        />
      </div>
    );
  }

  public handleWaitingForChallengeComponent() {
    return (
      <div>
        <Dimmer active={true} inverted={true}>
          <Loader>Waiting for challenges...</Loader>
          <Placeholder>
            <Placeholder.Image square={true} />
          </Placeholder>
        </Dimmer>
      </div>
    );
  }

  public componentRouter(currentState: Challenge) {
    if (currentState) {
      if (currentState.type === "image") {
        return this.drawPictureComponent(currentState);
      } else {
        return this.guessPictureComponent(currentState);
      }
    } else {
      return this.handleWaitingForChallengeComponent();
    }
  }

  public render() {
    const currentState = this.currentState();
    return (
      <div style={{ textAlign: "center" }}>
        {this.componentRouter(currentState)}
      </div>
    );
  }
}
