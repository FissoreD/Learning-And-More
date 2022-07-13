// import dynamic from 'next/dynamic';
import { Component, ReactElement } from "react";
import Automaton from "../../lib/automaton/fsm/DFA_NFA";

// const Graphviz = dynamic(() => import('graphviz-react'), { ssr: false });
import Graphviz from "graphviz-react";
import { Button, ButtonGroup } from "react-bootstrap";

const options = {
  fit: true,
  height: undefined,
  width: undefined,
  zoom: false,
}

interface Prop { automaton: Automaton }
interface State { show_aut: boolean }

export class AutomatonC extends Component<Prop, State>{

  constructor(prop: Prop) {
    super(prop)
    this.state = { show_aut: false }
  }

  create_automaton(bool: boolean) {
    this.setState((_state) => { return { show_aut: bool } })
  }

  render(): ReactElement {
    console.log(this.props.automaton.toDot());

    return <div className='text-center'>
      <ButtonGroup aria-label="...">
        <Button onClick={_ => { this.create_automaton(true) }}> Show</Button>
        <Button onClick={_ => { this.create_automaton(false) }}> Hide</Button>
      </ButtonGroup>
      {this.state.show_aut && <Graphviz className='automaton img-fluid' options={options} dot={this.props.automaton.toDot()} />}
    </div>
  }
}
