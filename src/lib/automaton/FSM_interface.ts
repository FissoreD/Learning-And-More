import Clonable from "../Clonable.interface";
import ToDot from "../ToDot.interface";
import ToString from "../ToString.interface";
import Alphabet from "./Alphabet.interface";
import State from "./State.interface";

export default interface FSM extends Clonable, ToDot, ToString {
  states: Map<string, State>;
  initialStates: State[];
  alphabet: Alphabet;

  /** 
   * @param p.bottom if present indicates the state to add in the complete automaton
   * @param p.alphabet is the alphabet to add in the current aut to be added
   * @return a fresh coplete FSM where missing transitions points to a new created ⊥ state 
   */
  complete(p?: { bottom?: State, alphabet?: Alphabet }): FSM;

  /** 
   * @returns a fresh Determinized FSM 
   */
  determinize(): FSM;

  /**
   * Hopcroft minimization Algorithm
   * @returns A fresh determinized & minimized automaton 
   * @link https://en.wikipedia.org/wiki/DFA_minimization
   */
  minimize(): FSM;


  union(aut: FSM): FSM;
  intersection(aut: FSM): FSM;
  difference(aut: FSM): FSM;
  symmetricDifference(aut: FSM): FSM;

  /** 
   * @returns a fresh deterministic complemented automaton 
   */
  complement(): FSM;

  getStateNumber(): number;
  getTransitionNumber(): number;
  isDeterministic(): boolean;

  sameLanguage(aut: FSM): boolean;

  /**
   * @return if the word passed in parameter is accepted by the automaton 
   */
  acceptWord(word: string): boolean;

  /** 
   * @return the state on which we are after reading word 
   */
  giveState(word: string): { stateName: string, state: State } | undefined;

  /**
   * @returns if the automaton is empty
   */
  isEmpty(): boolean;

  /**
   * @returns if the automaton is the universal automaton 
   */
  isFull(): boolean;

  findTransition(state: State, p: { symbol: string }): State[];
  acceptingStates(): State[];
  allStates(): State[];

  /**
   * @goal : find a path from the initial states to an accepting one
   * @param minLength : the length of the word to find (note : by default its zero) 
   * @returns a words of length at least minLength if it exists else the word of nearest length
   */
  findWordAccepted(minLength?: number): string | undefined;

  clone(): FSM
}