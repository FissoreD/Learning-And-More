export default class StateDFA {
  static Bottom = (alphabet: string | string[]) => new StateDFA("⊥", false, false, alphabet)
  isAccepting: boolean;
  isInitial: boolean;
  alphabet: string[];
  private outTransitions: Map<string, StateDFA[]>;
  private inTransitions: Map<string, StateDFA[]>;
  private successors: Set<StateDFA>;
  private predecessor: Set<StateDFA>;
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

  addTransition(symbol: string, state: StateDFA) {
    state = state || StateDFA.Bottom
    if (!this.outTransitions.has(symbol)) {
      this.outTransitions.set(symbol, [state])
    }
    if (this.outTransitions.get(symbol)!.includes(state)) return
    this.outTransitions.get(symbol)!.push(state);
    this.successors.add(state);
    state.predecessor.add(this);
    if (state.name !== "⊥")
      state.inTransitions.get(symbol)!.push(this);
  }

  getSuccessor(symbol: string): StateDFA[] {
    return this.outTransitions.get(symbol)!
  }

  /* istanbul ignore next */
  getPredecessor(symbol: string) {
    return this.inTransitions.get(symbol)!
  }

  getOutTransitionNumber(): number {
    return this.outTransitions.size
  }

  getAllSuccessors() {
    return this.successors
  }

  getAllOutTransitions() {
    return this.outTransitions
  }

  clone(p: { name?: string, alphabet?: string[] }) {
    return new StateDFA(p.name || this.name, this.isAccepting, this.isInitial, this.alphabet.concat(p.alphabet || []))
  }
}