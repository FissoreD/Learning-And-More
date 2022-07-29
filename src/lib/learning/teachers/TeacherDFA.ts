import FSM from "../../automaton/FSM_interface";
import AlphabetDFA from "../../automaton/regular/AlphabetDFA";
import DFA_NFA from "../../automaton/regular/DFA_NFA";
import StateDFA from "../../automaton/regular/StateDFA";
import Teacher from "./Teacher";

/**
 * This Teacher takes an Automaton Instance as parameter
 */
export class TeacherAutomaton implements Teacher<StateDFA> {
  description: string;
  alphabet: AlphabetDFA;
  regex: string;
  automaton: FSM<StateDFA>;
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
        automaton = DFA_NFA.regexToAutomaton(params.automaton as string).minimize()
        break;
      case "Dot":
        automaton = DFA_NFA.strToAutomaton(params.automaton as string).minimize()
        break;
    }
    this.automaton = automaton.minimize();
    this.alphabet = automaton.alphabet.clone();
    this.regex = params.type === "Regex" ? params.automaton as string : "Teacher with automaton"
    this.description = this.regex;
    this.counterExamples = [];
  }

  member(sentence: string): boolean {
    return this.automaton!.acceptWord(sentence);
  }

  equiv(automaton: DFA_NFA): string | undefined {
    let symDiff = this.automaton?.symmetricDifference(automaton) as DFA_NFA
    return symDiff.findWordAccepted()
  }
}