import { Graphviz } from "graphviz-react";
import React from "react";
import DiscTreeVPA from "../../../lib/learning/learners/discrimination_tree/DiscTreeVPA";


const options = {
  fit: true,
  height: undefined,
  width: undefined,
  zoom: false,
}

export default class DiscriminationTreeC extends React.Component<{ dt: DiscTreeVPA }>{
  render(): React.ReactElement {
    return <div className='text-center'>
      <Graphviz className='automaton img-fluid' options={options} dot={this.props.dt.toDot()} />
    </div>
  }
}