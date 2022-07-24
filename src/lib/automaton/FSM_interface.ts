
export default interface FSM<Alphabet, State> {
  states: Map<string, State>;
  initialStates: State[];
  alphabet: Alphabet;

  complete(p?: { bottom?: State, alphabet?: Alphabet }): FSM<Alphabet, State>;
  /** @returns a fresh Determinized FSM */
  determinize(): FSM<Alphabet, State>;
  /**
   * Hopcroft minimization Algorithm
   * If the automaton is not deterministic, it is determinized 
   * @returns A fresh determinized & minimized automaton 
   * @link https://en.wikipedia.org/wiki/DFA_minimization
   */
  minimize(): FSM<Alphabet, State>;
  /**
   * If both FSM are deterministic a deterministic FSM is returned
   * @returns a fresh FMS accepting the union of the two languages
   */
  union(aut: FSM<Alphabet, State>): FSM<Alphabet, State>;
  intersection(aut: FSM<Alphabet, State>): FSM<Alphabet, State>;
  difference(aut: FSM<Alphabet, State>): FSM<Alphabet, State>;
  symmetricDifference(aut: FSM<Alphabet, State>): FSM<Alphabet, State>;
  clone(): FSM<Alphabet, State>;
  /** @returns a fresh deterministic complemented automaton */
  complement(): FSM<Alphabet, State>;

  getStateNumber(): number;
  getTransitionNumber(): number;
  isDeterministic(): boolean;

  sameLanguage(aut: FSM<Alphabet, State>): boolean;
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
}