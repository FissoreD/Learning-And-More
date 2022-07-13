import Automaton from "../../automaton/fsm/DFA_NFA";
import { equivalenceFunction } from "./equiv";
import Teacher from "./teacher";

/**
 * This Teacher takes an Automaton Instance as parameter
 */
export class TeacherAutomaton implements Teacher {
  description: string;
  alphabet: string[];
  regex: string;
  automaton: Automaton;
  counter_examples?: string[];

  constructor(params: {
    type: "Automaton" | "Regex" | "Dot",
    automaton: Automaton | string
  }) {
    let automaton: Automaton;
    switch (params.type) {
      case "Automaton":
        automaton = (params.automaton as Automaton).minimize()
        break;
      case "Regex":
        automaton = Automaton.regex_to_automaton(params.automaton as string).minimize()
        break;
      case "Dot":
        automaton = Automaton.strToAutomaton(params.automaton as string).minimize()
        break;
    }
    this.automaton = automaton.minimize();
    this.alphabet = [...automaton.alphabet];
    this.regex = params.type === "Regex" ? params.automaton as string : "Teacher with automaton"
    this.description = this.regex;
    this.counter_examples = [];
  }

  member(sentence: string): boolean {
    return this.automaton!.accept_word(sentence);
  }

  equiv(automaton: Automaton): string | undefined {
    return equivalenceFunction(this, automaton)
  }
}