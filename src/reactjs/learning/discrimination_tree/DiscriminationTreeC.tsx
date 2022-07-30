import React from "react";
import DiscTreeDFA from "../../../lib/learning/learners/discrimination_tree/DiscTreeDFA";
import GraphDotRender from "../../components/DotRender";


export default class DiscriminationTreeC extends React.Component<{ dt: DiscTreeDFA }>{
  render(): React.ReactElement {
    return <div className='text-center'>
      <GraphDotRender dot={this.props.dt} />
    </div>
  }
}