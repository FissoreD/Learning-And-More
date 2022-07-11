import { Component, ReactElement, ReactNode } from "react";
import { LearnerBase } from "../../lib/learning/learners/observation_table/learner_base";
import { AutomatonC } from "../automaton/automaton";
import { ObservationTableC } from "./observation_table_c";

enum MESSAGE_TYPES { END, CONSISTENCY, CLOSEDNESS, CE, CL_AND_CON }

interface Prop { learner: LearnerBase, name: String }
interface State {
  do_next: boolean,
  memory: { ot: ReactElement, automaton: ReactElement | undefined, message: { type: MESSAGE_TYPES, val: string } }[],
  position: number
}


export abstract class Learner extends Component<Prop, State>{
  constructor(prop: Prop) {
    super(prop)
    this.state = {
      do_next: true,
      memory: [{
        message: { type: MESSAGE_TYPES.CE, val: "Learning with " + prop.name },
        ot: <ObservationTableC ot={prop.learner.ot.clone()} />,
        automaton: undefined
      }], position: 0
    };
  }

  abstract close_message(close_rep: string): string;
  abstract consistent_message(s1: string, s2: string, new_col: string): string;

  next_op(state: State): State {
    if (state.position === state.memory.length - 1) {
      let learner = this.props.learner;
      if (learner.finish) return state
      var message: { type: MESSAGE_TYPES, val: string };
      if (state.do_next && !this.props.learner.finish) {
        let prop;
        if ((prop = learner.is_close())) {
          message = { type: MESSAGE_TYPES.CLOSEDNESS, val: this.close_message(prop) }
        } else if ((prop = learner.is_consistent())) {
          message = {
            type: MESSAGE_TYPES.CONSISTENCY, val: this.consistent_message(prop[0], prop[1], prop[2])
          }
        } else if ((prop = learner.counter_example)) {
          message = {
            type: MESSAGE_TYPES.CE, val: "Received the counter-example " + prop
          }
        } else if (learner.finish || learner.automaton !== undefined) {
          message = {
            type: MESSAGE_TYPES.END, val: "The teacher has accepted the laste conjecture"
          }
        } else {
          message = {
            type: MESSAGE_TYPES.CL_AND_CON, val: "The table is closed and consistent"
          }
        }
      } else {
        this.props.learner.make_next_query()

        let old_msg = state.memory[state.position].message
        message = { ...old_msg };
        switch (old_msg.type) {
          case MESSAGE_TYPES.CONSISTENCY:
          case MESSAGE_TYPES.CLOSEDNESS:
            message.val = "The table has been modified"; break;
          case MESSAGE_TYPES.CE:
            message.val = "The counter-example has been added in S"; break;
          case MESSAGE_TYPES.CL_AND_CON:
            message.val = "The conjecture has been sent to the Teacher"; break;
          case MESSAGE_TYPES.END:
            return state
        }
      }
      let memory = state.memory;
      memory.push({
        message, ot: <ObservationTableC ot={learner.ot.clone()} />,
        automaton: learner.automaton ? <AutomatonC automaton={learner.automaton.clone()} /> : undefined
      })
      let position = state.position + 1
      state = { position, do_next: !state.do_next, memory }
    } else {
      state.position = state.position + 1
    }
    return state
  }

  prev_op(): void {
    if (this.state.position > 0) {
      this.setState({ position: this.state.position - 1 })
    }
  }

  all_steps() {
    let state = { ...this.state }
    while (!this.props.learner.finish) state = this.next_op(state)
    this.setState({ ...state })
    this.setState({ position: this.state.memory.length - 1 })
  }

  reload() {
    this.setState({ position: 0 })
  }

  create_card(title: string, content: ReactElement) {
    return <div className="card">
      <div className="card-header">
        {title}
      </div>
      <div className="card-body">
        {content}
      </div>
    </div>
  }

  create_text(msg: string) {
    return <p className="text-center m-0">{msg}</p>
  }

  render(): ReactNode {
    let position = this.state.position
    let memory_cell = this.state.memory[position]
    return <div className="container">
      <div className="text-end sticky-top">
        <div className="btn-group sticky-top " role="group" aria-label="Btn-group8">
          <button type="button" className="btn btn-secondary" onClick={() => this.reload()} >Reload</button >
          <button type="button" className="btn btn-secondary" disabled={position === 0} onClick={() => this.prev_op()} >Previous</button >
          <button type="button" className="btn btn-secondary" disabled={position === this.state.memory.length - 1 && this.props.learner.finish} onClick={() => this.setState(this.next_op(this.state))}>Next</button>
          <button type="button" className="btn btn-secondary" onClick={() => this.all_steps()}>Run all algo</button>
        </div>
      </div>
      <div className="carousel slide">
        {this.create_card("Language to Learn", this.create_text(this.props.name + " TODO"))}
        {this.create_card("Message", this.create_text(memory_cell.message.val))}
        {memory_cell.automaton ? this.create_card("Automaton", memory_cell.automaton!) : <></>}
        {this.create_card("Observation Table", memory_cell.ot)}
      </div>
    </div>
  }
}