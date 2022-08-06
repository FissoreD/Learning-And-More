import { graphviz } from 'd3-graphviz';
import * as React from 'react';
import ToDot from '../../lib/ToDot.interface';
import { GRAPHVIZ_OPTIONS } from '../globalVars';

interface Props {
  dot: ToDot;
  className?: string;
}

export default class GraphDotToRender extends React.Component<Props, any> {
  private static count = 0;
  private id: string;

  constructor(props: Props) {
    super(props);
    this.id = `graphviz${GraphDotToRender.count}`;
    GraphDotToRender.count += 1;
  }

  public render = (): JSX.Element => {
    console.log();

    return <div className={`${this.props.className} automaton img-fluid`} id={this.id} />;
  };

  public componentDidMount = () => {
    this.renderGraph();
  };

  public componentDidUpdate = () => {
    this.renderGraph();
  };

  private renderGraph = () => {
    const { dot } = this.props;
    graphviz(`#${this.id}`)
      .options(GRAPHVIZ_OPTIONS)
      .renderDot(dot.toDot());
  };
}


