import Clonable from "../Clonable.interface";
import ToDot from "../ToDot.interface";
import ToString from "../ToString.interface";
import Alphabet from "./Alphabet.interface";

export default interface FSM<StateType> extends Clonable, ToDot, ToString {
  states: Map<string, StateType>;
  initialStates: StateType[];
  alphabet: Alphabet;

  /** 
   * @param p.bottom if present indicates the state to add in the complete automaton
   * @param p.alphabet is the alphabet to add in the current aut to be added
   * @return a fresh coplete FSM where missing transitions points to a new created ⊥ state 
   */
  complete(p?: { bottom?: StateType, alphabet?: Alphabet }): FSM<StateType>;

  /** 
   * @returns a fresh Determinized FSM 
   */
  determinize(): FSM<StateType>;

  /**
   * Hopcroft minimization Algorithm
   * @returns A fresh determinized & minimized automaton 
   * @link https://en.wikipedia.org/wiki/DFA_minimization
   */
  minimize(): FSM<StateType>;


  union(aut: FSM<StateType>): FSM<StateType>;
  intersection(aut: FSM<StateType>): FSM<StateType>;
  difference(aut: FSM<StateType>): FSM<StateType>;
  symmetricDifference(aut: FSM<StateType>): FSM<StateType>;

  /** 
   * @returns a fresh deterministic complemented automaton 
   */
  complement(): FSM<StateType>;

  getStateNumber(): number;
  getTransitionNumber(): number;
  isDeterministic(): boolean;

  sameLanguage(aut: FSM<StateType>): boolean;

  /**
   * @return if the word passed in parameter is accepted by the automaton 
   */
  acceptWord(word: string): boolean;

  /** 
   * @return the state on which we are after reading word 
   */
  giveState(word: string): StateType | undefined;

  /**
   * @returns if the automaton is empty
   */
  isEmpty(): boolean;

  /**
   * @returns if the automaton is the universal automaton 
   */
  isFull(): boolean;

  findTransition(state: StateType, symbol: string): StateType[];
  acceptingStates(): StateType[];
  allStates(): StateType[];

  /**
   * @goal : find a path from the initial states to an accepting one
   * @param minLength : the length of the word to find (note : by default its zero) 
   * @returns a words of length at least minLength if it exists else the word of nearest length
   */
  findWordAccepted(minLength?: number): string | undefined;

  clone(): FSM<StateType>
}