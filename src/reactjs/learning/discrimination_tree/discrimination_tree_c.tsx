import { Graphviz } from "graphviz-react";
import React from "react";
import DiscriminationTree from "../../../lib/learning/learners/discrimination_tree/discrimination_tree";


const options = {
  fit: true,
  height: undefined,
  width: undefined,
  zoom: false,
}

export default class DiscriminationTreeC extends React.Component<{ dt: DiscriminationTree }>{
  render(): React.ReactElement {
    return <div className='text-center'>
      {/* <button type="button" className="btn btn-primary" onClick={(e) => { e.currentTarget.style.display = "none"; this.create_automaton() }}>Show automaton</button> */}
      <Graphviz className='automaton img-fluid' options={options} dot={this.props.dt.toDot()} />
    </div>
  }
}