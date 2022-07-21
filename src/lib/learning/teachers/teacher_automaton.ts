import DFA_NFA from "../../automaton/fsm/DFA_NFA";
import { equivalenceFunction } from "./equiv";
import Teacher from "./teacher";

/**
 * This Teacher takes an Automaton Instance as parameter
 */
export class TeacherAutomaton implements Teacher {
  description: string;
  alphabet: string[];
  regex: string;
  automaton: DFA_NFA;
  counterExamples?: string[];

  constructor(params: {
    type: "Automaton" | "Regex" | "Dot",
    automaton: DFA_NFA | string
  }) {
    let automaton: DFA_NFA;
    switch (params.type) {
      case "Automaton":
        automaton = (params.automaton as DFA_NFA).minimize()
        break;
      case "Regex":
        automaton = DFA_NFA.regex2automaton(params.automaton as string).minimize()
        break;
      case "Dot":
        automaton = DFA_NFA.strToAutomaton(params.automaton as string).minimize()
        break;
    }
    this.automaton = automaton.minimize();
    this.alphabet = [...automaton.alphabet];
    this.regex = params.type === "Regex" ? params.automaton as string : "Teacher with automaton"
    this.description = this.regex;
    this.counterExamples = [];
  }

  member(sentence: string): boolean {
    return this.automaton!.acceptWord(sentence);
  }

  equiv(automaton: DFA_NFA): string | undefined {
    return equivalenceFunction(this, automaton)
  }
}