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
import drawshit from "../../drawshit.png";

export interface Challenge {
  type: "image" | "phrase";
  payload: string;
}
interface State {
  currentIndex: number;
  roomCode: string;
  pending: Challenge[];
  attempt?: Challenge;
}

export class DrawShitContainer extends React.Component<
  RouteComponentProps<{ room: string }>,
  State
> {
  public state: State = {
    attempt: undefined,
    currentIndex: 0,
    pending: [
      { type: "phrase", payload: drawshit },
      { type: "image", payload: "Dickbutt" }
    ],
    roomCode: ""
  };

  private sketch: { redo: () => void; undo: () => void };
  constructor(props) {
    super(props);
    this.handleUndoClick = this.handleUndoClick.bind(this);
    this.handleRedoClick = this.handleRedoClick.bind(this);
    this.handleGuessUpdate = this.handleGuessUpdate.bind(this);
    this.handleGuessClick = this.handleGuessClick.bind(this);
  }

  public componentDidMount() {
    this.setState({ roomCode: this.props.match.params.room });
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
        <Icon size="huge" name="save" onClick={this.handleGuessClick} />
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

  public handleGuessUpdate(event: React.FormEvent<HTMLInputElement>) {
    const currentToGuess = this.state.pending[this.state.currentIndex];
    this.setState({
      attempt: {
        type: currentToGuess.type,
        payload: event.currentTarget.value
      }
    });
  }

  public handleGuessClick() {
    this.setState({
      currentIndex: this.state.currentIndex + 1
    });
  }

  public guessPictureComponent(toGuess: Challenge) {
    const currentValue = this.state.attempt ? this.state.attempt.payload : "";
    const width = window.innerWidth + "px";
    const height = window.innerHeight - 250 + "px";

    return (
      <div>
        <Image src={toGuess.payload} height={height} width={width} />
        <Header as="h2">WTF Is it</Header>
        <Input
          onChange={this.handleGuessUpdate}
          value={currentValue}
          action={
            <Button primary={true} onClick={this.handleGuessClick}>
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
