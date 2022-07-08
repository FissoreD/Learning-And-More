export class State {
  isAccepting: boolean;
  isInitial: boolean;
  alphabet: string[];
  outTransitions: Map<string, State[]>;
  inTransitions: Map<string, State[]>;
  successors: Set<State>;
  predecessor: Set<State>;
  name: string;

  constructor(name: string, isAccepting: boolean, isInitial: boolean, alphabet: string[] | string) {
    this.name = name;
    this.isAccepting = isAccepting;
    this.isInitial = isInitial;
    this.alphabet = Array.from(alphabet);
    this.outTransitions = new Map();
    this.inTransitions = new Map();
    this.successors = new Set();
    this.predecessor = new Set();
    for (const symbol of alphabet) {
      this.outTransitions.set(symbol, []);
      this.inTransitions.set(symbol, []);
    }
  }

  add_transition(symbol: string, state: State) {
    if (this.outTransitions.get(symbol)!.includes(state)) return
    this.outTransitions.get(symbol)!.push(state);
    this.successors.add(state);
    state.predecessor.add(this);
    state.inTransitions.get(symbol)!.push(this);
  }

  getSuccessor(symbol: string) {
    return this.outTransitions.get(symbol)!
  }

  /* istanbul ignore next */
  getPredecessor(symbol: string) {
    return this.inTransitions.get(symbol)!
  }

  clone() {
    return new State(this.name, this.isAccepting, this.isInitial, this.alphabet)
  }

  static bottom(alphabet: string[]) {
    return new State("bottom", false, false, alphabet)
  }
}