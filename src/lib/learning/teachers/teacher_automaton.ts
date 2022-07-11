import { Automaton } from "../../automaton/fsm/DFA_NFA";
import { equivalenceFunction } from "./equiv";
import { Teacher } from "./teacher";

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
    automaton: Automaton | string,
    description?: string,
    regex?: string,
    counter_examples?: string[]
  }) {
    let automaton = (params.automaton instanceof Automaton ?
      params.automaton : Automaton.strToAutomaton(params.automaton)).minimize()
    this.automaton = automaton.minimize();
    this.alphabet = automaton.alphabet;
    this.regex = params.regex !== undefined ? params.regex : "Teacher with automaton"
    this.description = params.description !== undefined ? params.description : "Teacher with automaton";
    this.counter_examples = params.counter_examples;
  }

  member(sentence: string): boolean {
    return this.automaton!.accept_word(sentence);
  }

  equiv(automaton: Automaton): string | undefined {
    return equivalenceFunction(this, automaton)
  }

}