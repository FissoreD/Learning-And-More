import Graphviz from "graphviz-react";
import React from "react";
import DFA_NFA from "../../lib/automaton/regular/DFA_NFA";
import { graphvizOptions } from "../globalVars";

interface Prop { automaton: DFA_NFA }
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
      <Graphviz className='automaton img-fluid' options={graphvizOptions} dot={this.props.automaton.toDot()} />
    </div>
  }
}
