import AlphabetVPA from "../../automaton/context_free/AlphabetVPA";
import StateVPA from "../../automaton/context_free/StateVPA";
import VPA from "../../automaton/context_free/VPA";
import Teacher from "./Teacher";

export default class TecherVPA implements Teacher<AlphabetVPA, StateVPA>{
  description: string;
  alphabet: AlphabetVPA;
  regex: string;
  automaton?: VPA;

  constructor(p: { alphabet: AlphabetVPA, automaton: VPA }) {
    this.automaton = p.automaton
    this.alphabet = p.alphabet
    this.description = ""
    this.regex = ""
  }

  member(sentence: string): boolean {
    throw new Error("Method not implemented.");
  }
  equiv(automaton: VPA): string | undefined {
    throw new Error("Method not implemented.");
  }

}