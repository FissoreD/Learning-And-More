import { Component, ReactNode } from "react";
import { Automaton } from "../lib/automaton/fsm/DFA_NFA";
import { L_star } from "../lib/learning/learners/observation_table/l_star";
import { TeacherAutomaton } from "../lib/learning/teachers/teacher_automaton";
import { Learner } from "./learning/learner";
import { NavBar } from "./nav_bar";

export class Main extends Component {
  render(): ReactNode {
    return <>
      <NavBar />
      <Learner l={new L_star(new TeacherAutomaton({
        automaton: Automaton.strToAutomaton(`[0]
      a,[0]->[0]
      [0]`)
      }))} />
    </>
  }
}