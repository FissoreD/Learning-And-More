import FSM from "../../automaton/FSM_interface";

export default interface Teacher<Alphabet, State> {
  description: string;
  alphabet: Alphabet;
  counterExamples?: string[];
  regex: string;
  automaton?: FSM<Alphabet, State>;
  /**
   * @param sentence the sentence to test the membership
   * @returns if the sentence is accepted
   */
  member(sentence: string): boolean;
  /**
   * @param automaton
   * @returns undefined if the automaton recognizes the teacher's language, a counter-example otherwise
   */
  equiv(automaton: FSM<Alphabet, State>): string | undefined;
}