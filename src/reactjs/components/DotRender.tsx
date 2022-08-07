import { graphviz } from 'd3-graphviz';
import * as React from 'react';
import { Download } from 'react-bootstrap-icons';
import ToDot from '../../lib/ToDot.interface';
import { downloadSvg } from '../globalFunctions';
import { GRAPHVIZ_OPTIONS } from '../globalVars';
import TooltipImg from './Tooltip';

interface Props {
  dot: ToDot;
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
    let donwloadImg = <Download className='mx-1 float-end text-hover' onClick={() => {
      downloadSvg(this.id)
    }} />
    return <div className='position-relative h-100 w-100'>
      <TooltipImg title='Download' cnt={donwloadImg} />
      <div className={`automaton img-fluid`} id={this.id} />
    </div>;
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


