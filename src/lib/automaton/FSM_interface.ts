import Alphabet from "./Alphabet.interface";

export default interface FSM<State> {
  states: Map<string, State>;
  initialStates: State[];
  alphabet: Alphabet;

  /** In place method to add missing transitions to a new created ⊥ state */
  complete(p?: { bottom?: State, alphabet?: Alphabet }): FSM<State>;
  /** @returns a fresh Determinized FSM */
  determinize(): FSM<State>;
  /**
   * Hopcroft minimization Algorithm
   * @returns A fresh determinized & minimized automaton 
   * @link https://en.wikipedia.org/wiki/DFA_minimization
   */
  minimize(): FSM<State>;
  /**
   * If both FSM are deterministic a deterministic FSM is returned
   * @returns a fresh FMS accepting the union of the two languages
   */
  union(aut: FSM<State>): FSM<State>;
  intersection(aut: FSM<State>): FSM<State>;
  difference(aut: FSM<State>): FSM<State>;
  symmetricDifference(aut: FSM<State>): FSM<State>;
  clone(): FSM<State>;
  /** @returns a fresh deterministic complemented automaton */
  complement(): FSM<State>;

  getStateNumber(): number;
  getTransitionNumber(): number;
  isDeterministic(): boolean;

  sameLanguage(aut: FSM<State>): boolean;
  acceptWord(word: string): boolean;
  /** @return the state on which we are after reading word */
  giveState(word: string): State | undefined;
  isEmpty(): boolean;
  /** @returns if the automaton is the universal automaton */
  isFull(): boolean;

  findTransition(state: State, symbol: string): State[];
  acceptingStates(): State[];
  allStates(): State[];

  toString(): string;
  toDot(): string;
}