import React from "react";
import DiscTreeDFA from "../../../../lib/learning/learners/discrimination_tree/DiscTreeDFA";
import GraphDotRender from "../../../components/DotRender";
import { logRender } from "../../../globalFunctions";


export default class DiscriminationTreeViewer extends React.Component<{ dt: DiscTreeDFA }>{
  render(): React.ReactElement {
    logRender("DiscriminationTreeC")
    return <div className='text-center'>
      <GraphDotRender dot={this.props.dt} />
    </div>
  }
}