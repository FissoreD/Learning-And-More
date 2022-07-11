// import dynamic from 'next/dynamic';
import { Component, ReactElement, ReactNode } from "react";
import { Automaton } from "../../lib/automaton/fsm/DFA_NFA";

// const Graphviz = dynamic(() => import('graphviz-react'), { ssr: false });
import Graphviz from "graphviz-react";


const options = {
  fit: true,
  height: undefined,
  width: undefined,
  zoom: false,
}

interface Prop { automaton: Automaton }

export class AutomatonC extends Component<Prop, { x: ReactElement | undefined }>{

  constructor(prop: Prop) {
    super(prop)
    this.state = { x: undefined }
  }

  create_automaton() {
    if (this.state.x === undefined) {
      this.setState({
        x: <Graphviz className='automaton img-fluid' options={options} dot={this.props.automaton.automatonToDot()} />
      })
    }
  }

  render(): ReactNode {
    return <div className='text-center'>
      <button type="button" className="btn btn-primary" onClick={(e) => { e.currentTarget.style.display = "none"; this.create_automaton() }}>Show automaton</button>
      {this.state.x}
    </div>
  }
}
