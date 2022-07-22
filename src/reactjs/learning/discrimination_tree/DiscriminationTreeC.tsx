import { Graphviz } from "graphviz-react";
import React from "react";
import DiscTreeDFA from "../../../lib/learning/learners/discrimination_tree/DiscTreeDFA";
import { graphvizOptions } from "../../globalVars";


export default class DiscriminationTreeC extends React.Component<{ dt: DiscTreeDFA }>{
  render(): React.ReactElement {
    return <div className='text-center'>
      <Graphviz className='automaton img-fluid' options={graphvizOptions} dot={this.props.dt.toDot()} />
    </div>
  }
}