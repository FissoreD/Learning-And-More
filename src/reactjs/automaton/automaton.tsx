// import dynamic from 'next/dynamic';
import React from "react";
import Automaton from "../../lib/automaton/fsm/DFA_NFA";

// const Graphviz = dynamic(() => import('graphviz-react'), { ssr: false });
import Graphviz from "graphviz-react";

const options = {
  fit: true,
  height: undefined,
  width: undefined,
  useWorker: false,
  zoom: false,
}

interface Prop { automaton: Automaton }
interface State { showAut: boolean }

export default class AutomatonC extends React.Component<Prop, State>{

  constructor(prop: Prop) {
    super(prop)
    this.state = { showAut: false }
  }

  create_automaton(bool: boolean) {
    this.setState((_state) => { return { showAut: bool } })
  }

  render(): React.ReactElement {
    return <div className='text-center'>
      <Graphviz className='automaton img-fluid' options={options} dot={this.props.automaton.toDot()} />
    </div>
  }
}
