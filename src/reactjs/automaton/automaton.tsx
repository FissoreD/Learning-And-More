import { Component, ReactNode } from "react";
import { Automaton } from "../../lib/automaton/fsm/DFA_NFA";

interface Prop { automaton: Automaton }

export class AutomatonC extends Component<Prop>{

  render(): ReactNode {
    // return <Graphviz dot={this.props.automaton.automatonToDot()} />
    // return <pre>{this.props.automaton.toString()}</pre>

    var dotIndex = 0;

    // var graphviza = graphviz("#graph").dot(this.props.automaton.automatonToDot())

    return <></>
  }
}
