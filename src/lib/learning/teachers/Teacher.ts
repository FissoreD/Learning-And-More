import Alphabet from "../../automaton/Alphabet.interface";
import FSM from "../../automaton/FSM_interface";

export default abstract class Teacher<State> {
  description: string;
  alphabet: Alphabet;
  counterExamples?: string[];
  regex: string;
  automaton: FSM<State>;

  constructor(p: { automaton: FSM<State> }) {
    this.description = ""
    this.alphabet = p.automaton.alphabet.clone()
    this.regex = ""
    this.automaton = p.automaton.minimize()
  }

  /**
   * @param sentence the sentence to test the membership
   * @returns if the sentence is accepted
   */
  member(sentence: string): boolean {
    return this.automaton!.acceptWord(sentence);
  }

  /**
   * @param automaton
   * @returns undefined if the automaton recognizes the teacher's language, a counter-example otherwise
   */


  equiv(automaton: FSM<State>): string | undefined {
    let symDiff = this.automaton?.symmetricDifference(automaton)
    return symDiff.findWordAccepted()
  }
}