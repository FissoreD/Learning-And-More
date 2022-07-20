import Automaton from "../../automaton/fsm/DFA_NFA";

export default interface Teacher {
  description: string;
  alphabet: string[];
  counterExamples?: string[];
  regex: string;
  automaton?: Automaton;
  /**
   * @param sentence the sentence to test the membership
   * @returns if the sentence is accepted
   */
  member(sentence: string): boolean;
  /**
   * @param automaton
   * @returns undefined if the automaton recognizes the teacher's language, a counter-example otherwise
   */
  equiv(automaton: Automaton): string | undefined;
}