import { Component, ReactNode } from "react";
import aut from "../json/automata.json";
import Automaton from "../lib/automaton/fsm/DFA_NFA";
import TTT from "../lib/learning/learners/discrimination_tree/TTT";
import { L_star } from "../lib/learning/learners/observation_table/l_star";
import { NL_star } from "../lib/learning/learners/observation_table/nl_star";
import { TeacherAutomaton } from "../lib/learning/teachers/teacher_automaton";
import TTTC from "./learning/discrimination_tree/tttC";
import LStarC from "./learning/observation_table/l_star";
import { NLStarC } from "./learning/observation_table/nl_star";
import { NavBar } from "./nav_bar";

interface State { cnt: ReactNode }

export class Main extends Component<{}, State> {
  constructor(prop: {}) {
    super(prop)
    this.state = {
      cnt: <LStarC name={"L-Star"} learner={new L_star(new TeacherAutomaton({
        automaton: Automaton.strToAutomaton(aut["(a+b)*a(a+b)^4"])
      }))} />
    }
  }

  change_cnt(algo: "L*" | "NL*" | "TTT") {
    let cnt: ReactNode;
    let teacher = new TeacherAutomaton({
      automaton: Automaton.strToAutomaton(aut["(a+b)*a(a+b)^4"])
    })
    switch (algo) {
      case "L*": cnt = <LStarC name={"L-Star"} learner={new L_star(teacher)} />; break;
      case "NL*": cnt = <NLStarC name={"NL-Star"} learner={new NL_star(teacher)} />; break;
      case "TTT": cnt = <TTTC name={"TTT"} learner={new TTT(teacher)} />; break
    }
    this.setState({ cnt })
  }

  render(): ReactNode {
    return <>
      <NavBar change_cnt={(e) => this.change_cnt(e)} />
      {this.state.cnt}
    </>
  }
}