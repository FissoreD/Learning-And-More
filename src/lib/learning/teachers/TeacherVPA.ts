import AlphabetVPA from "../../automaton/context_free/AlphabetVPA";
import StateVPA from "../../automaton/context_free/StateVPA";
import VPA from "../../automaton/context_free/VPA";
import Teacher from "./Teacher";

export default class TecherVPA implements Teacher<StateVPA>{
  description: string;
  alphabet: AlphabetVPA;
  regex: string;
  automaton?: VPA;

  constructor(p: { automaton: VPA }) {
    this.automaton = p.automaton
    this.alphabet = p.automaton.alphabet.clone()
    this.description = ""
    this.regex = ""
  }

  member(sentence: string): boolean {
    return this.automaton!.acceptWord(sentence);
  }

  equiv(automaton: VPA): string | undefined {
    let symDiff = this.automaton?.symmetricDifference(automaton) as VPA
    return symDiff.findWordAccepted()
  }
}