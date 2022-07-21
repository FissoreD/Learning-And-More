import { Graphviz } from "graphviz-react";
import React from "react";
import DiscTreeDFA from "../../../lib/learning/learners/discrimination_tree/DiscTreeDFA";


const options = {
  fit: true,
  height: undefined,
  width: undefined,
  zoom: false,
}

export default class DiscriminationTreeC extends React.Component<{ dt: DiscTreeDFA }>{
  render(): React.ReactElement {
    console.log(this.props.dt.toDot());

    return <div className='text-center'>
      <Graphviz className='automaton img-fluid' options={options} dot={this.props.dt.toDot()} />
    </div>
  }
}