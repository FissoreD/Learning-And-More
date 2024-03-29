import DFA_NFA from "../../automaton/regular/DFA_NFA";
import Teacher from "./Teacher";

interface constructorType {
  type: "Automaton" | "Regex" | "Dot",
  automaton: DFA_NFA | string
}

export default class TeacherDFA extends Teacher {

  constructor(params: constructorType) {
    super({ automaton: TeacherDFA.giveAutomaton(params) })
  }

  private static giveAutomaton(p: constructorType) {
    switch (p.type) {
      case "Automaton":
        return (p.automaton as DFA_NFA)
      case "Regex":
        return DFA_NFA.regexToAutomaton(p.automaton as string)
      case "Dot":
        return DFA_NFA.strToAutomaton(p.automaton as string)
    }
  }
}