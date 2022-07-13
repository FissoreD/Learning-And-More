import { Graphviz } from "graphviz-react";
import { Component, ReactElement } from "react";
import DiscriminationTree from "../../../lib/learning/learners/discrimination_tree/discrimination_tree";


const options = {
  fit: true,
  height: undefined,
  width: undefined,
  zoom: false,
}

export default class DiscriminationTreeC extends Component<{ dt: DiscriminationTree }>{
  render(): ReactElement {
    return <div className='text-center'>
      {/* <button type="button" className="btn btn-primary" onClick={(e) => { e.currentTarget.style.display = "none"; this.create_automaton() }}>Show automaton</button> */}
      <Graphviz className='automaton img-fluid' options={options} dot={this.props.dt.toDot()} />
    </div>
  }
}