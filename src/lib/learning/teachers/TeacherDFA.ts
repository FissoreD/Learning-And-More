import DFA_NFA from "../../automaton/regular/DFA_NFA";
import StateDFA from "../../automaton/regular/StateDFA";
import Teacher from "./Teacher";

type constructorType = {
  type: "Automaton" | "Regex" | "Dot",
  automaton: DFA_NFA | string
}

export class TeacherAutomaton extends Teacher<StateDFA> {

  constructor(params: constructorType) {
    super({ automaton: TeacherAutomaton.giveAutomaton(params) })
    if (params.type === "Regex") {
      this.regex = params.automaton as string
    }
  }

  private static giveAutomaton(p: constructorType) {
    switch (p.type) {
      case "Automaton":
        return (p.automaton as DFA_NFA).minimize()
      case "Regex":
        return DFA_NFA.regexToAutomaton(p.automaton as string).minimize()
      case "Dot":
        return DFA_NFA.strToAutomaton(p.automaton as string).minimize()
    }
  }
}