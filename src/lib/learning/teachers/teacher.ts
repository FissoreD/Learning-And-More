import { Automaton } from "../../automaton/fsm/DFA_NFA";

export interface Teacher {
  description: string;
  alphabet: string[];
  counter_examples?: string[];
  regex: string;
  automaton?: Automaton;
  /**
   * @param sentence the sentence to test the membership
   * @returns the string "0" if the sentence is accepted else "1"
   */
  member(sentence: string): string;
  /**
   * @param automaton
   * @returns undefined if the automaton recognizes the teacher's language, a counter-example otherwise
   */
  equiv(automaton: Automaton): string | undefined;
}