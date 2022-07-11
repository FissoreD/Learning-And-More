import { Component, ReactNode } from "react";
import aut from "../json/automata.json";
import { Automaton } from "../lib/automaton/fsm/DFA_NFA";
import { L_star } from "../lib/learning/learners/observation_table/l_star";
import { TeacherAutomaton } from "../lib/learning/teachers/teacher_automaton";
import { LStarC } from "./learning/observation_table/l_star";
import { NavBar } from "./nav_bar";


export class Main extends Component {
  render(): ReactNode {
    return <>
      <NavBar />
      <div className="container"></div>
      <LStarC name={"L-Star"} learner={new L_star(new TeacherAutomaton({
        automaton: Automaton.strToAutomaton(aut.a1)
      }))} />
    </>
  }
}