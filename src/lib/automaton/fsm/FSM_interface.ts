export interface FSM<Alphabet, State> {
  states: Map<string, State>;
  initialStates: State[];
  alphabet: Alphabet;

  complete(bottom?: State): FSM<Alphabet, State>;
  /** @returns a fresh Determinized FSM */
  determinize(): FSM<Alphabet, State>;
  minimize(): FSM<Alphabet, State>;
  union(aut: FSM<Alphabet, State>): FSM<Alphabet, State>;
  intersection(aut: FSM<Alphabet, State>): FSM<Alphabet, State>;
  difference(aut: FSM<Alphabet, State>): FSM<Alphabet, State>;
  symmetric_difference(aut: FSM<Alphabet, State>): FSM<Alphabet, State>;
  clone(): FSM<Alphabet, State>;
  /** @returns a deterministic complemented automaton */
  complement(): FSM<Alphabet, State>;

  state_number(): number;
  transition_number(): number;
  is_deterministic(): boolean;

  same_language(aut: FSM<Alphabet, State>): boolean;
  accept_word(word: string): boolean;
  give_state(word: string): State | undefined;
  is_empty(): boolean;
  /** @returns if the automaton is the universal automaton */
  is_full(): boolean;

  findTransition(state: State, symbol: string): State[];
  accepting_states(): State[];
  all_states(): State[];

  automatonToDot(): String;
  toString(): String;
}