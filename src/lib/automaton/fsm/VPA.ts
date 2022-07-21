import { todo, toEps } from "../../tools";
import FSM from "./FSM_interface";
import { AlphabetVPA, StateVPA } from "./state_vpa";

export type ALPHABET_TYPE = "INT" | "RET" | "CALL"
export const ALPH_TYPE_LIST: ALPHABET_TYPE[] = ["INT", "RET", "CALL"]

export default class VPA implements FSM<AlphabetVPA, StateVPA> {
  states: Map<string, StateVPA>;
  initialStates: StateVPA[];
  alphabet: AlphabetVPA;
  stack: string[];
  stackAlphabet: string[];

  /** @todo: stack alphabet can be undefined and therefore self-created */
  constructor(stateList: Set<StateVPA> | StateVPA[]) {
    stateList = new Set(stateList);
    this.states = new Map();
    stateList.forEach(e => this.states.set(e.name, e));
    this.stack = []
    this.stackAlphabet = [...stateList][0].stackAlphabet

    this.initialStates = this.allStates().filter(s => s.isInitial);
    this.alphabet = {
      CALL: [...new Set([...stateList].map(e => e.alphabet.CALL).flat())],
      RET: [...new Set([...stateList].map(e => e.alphabet.RET).flat())],
      INT: [...new Set([...stateList].map(e => e.alphabet.INT).flat())]
    };
  }

  giveState(word: string): StateVPA | undefined {
    return this.readWord(word)[0]
  }

  complete(p?: { bottom?: StateVPA, alphabet?: AlphabetVPA, stackAlp?: string[] }): VPA {
    let alphabet = p?.alphabet || this.alphabet
    let stackAlph = p?.stackAlp || this.stackAlphabet
    let bottom = p?.bottom || StateVPA.Bottom(alphabet, stackAlph)
    let toAdd = false;

    for (const alphType of ALPH_TYPE_LIST) {
      for (const symbol of alphabet[alphType]) {
        for (let pos = 0; pos < (alphType === "INT" ? 1 : stackAlph.length); pos++) {
          let topStack = alphType === "INT" ? "" : stackAlph[pos]
          bottom.addTransition({ type: alphType, symbol, topStack, successor: bottom });
          for (const state of this.states.values()) {
            if (alphType !== "INT") this.stack.push(stackAlph[pos])
            let transintion = this.findTransition(state, symbol)
            if (transintion === undefined || transintion.length === 0) {
              state.addTransition({ type: alphType, symbol, topStack, successor: bottom });
              toAdd = true;
            }
          }
        }
      }
    }
    if (toAdd) {
      this.states.set(bottom.name, bottom)
    }
    return this
  }

  determinize(): VPA {
    throw todo();
  }

  minimize(): VPA {
    throw todo();
  }

  union(aut: VPA): VPA {
    let res;
    let states = [
      ...aut.allStates().map(e => e.clone({ name: "1" + e.name })),
      ...this.allStates().map(e => e.clone({ name: "2" + e.name }))
    ];
    let alphabet = VPA.cloneAndUnionAlphabet(...states.map(e => e.alphabet));
    let stack = [...new Set([...aut.stackAlphabet, ... this.stackAlphabet])]
    states.forEach(e => e.alphabet = alphabet)
    res = new VPA(states);
    res.complete()

    this.flatAlphabet(alphabet).forEach(symbol => {
      for (let i = 0; i < (alphabet.INT.includes(symbol) ? 1 : stack.length); i++) {
        aut.allStates().forEach((e, pos) => e.getSuccessor({ symbol, topStack: stack[i] })?.forEach(succ =>
          states[pos].addTransition({
            symbol: symbol,
            successor: states[aut.allStates().indexOf(succ)],
            topStack: stack[i]
          })
        ))

        this.allStates().forEach((e, pos) => e.getSuccessor({ symbol, topStack: stack[i] })?.forEach(succ =>
          states[pos + aut.allStates().length].addTransition({
            symbol: symbol,
            successor: states[this.allStates().indexOf(succ) + aut.allStates().length],
            topStack: stack[i]
          })
        ))
      }
    });
    /** @todo uncomment when finished */
    // if (this.isDeterministic() && aut.isDeterministic()) {
    //   return res.determinize()
    // }
    return res;
  }

  intersection(aut: VPA): VPA {
    return aut.complement([this.alphabet, aut.alphabet]).union(this.complement([this.alphabet, aut.alphabet])).complement([this.alphabet, aut.alphabet])
  }

  difference(aut: VPA): VPA {
    return aut.union(this.complement()).complement()
  }

  symmetricDifference(aut: VPA): VPA {
    return this.difference(aut).union(aut.difference(this));
  }

  clone(alphabet?: AlphabetVPA): VPA {
    let all_states = this.allStates()
    let res = new VPA(all_states.map(e => e.clone({ alphabet })));
    this.flatAlphabet(this.alphabet).forEach(symbol =>
      all_states.forEach((e, pos) =>
        e.getSuccessor({ symbol }).forEach(succ => res.allStates()[pos].addTransition({
          symbol,
          successor: res.allStates()[all_states.indexOf(succ)]
        }))
      ))
    return res;
  }

  complement(alphabet?: AlphabetVPA[]): VPA {
    let res = this.clone();
    res.alphabet = alphabet ? VPA.cloneAndUnionAlphabet(...alphabet) : VPA.cloneAndUnionAlphabet(this.alphabet)
    res.complete()
    if (!res.isDeterministic()) {
      res = this.determinize();
    }
    res.allStates().forEach(e => {
      e.isAccepting = !e.isAccepting
    });
    return res;
  }

  getStateNumber(): number {
    return this.states.size
  }

  getTransitionNumber(): number {
    return [...this.states.values()].reduce((a, b) => a + b.getOutTransitionNumber(), 0)
  }

  static cloneAndUnionAlphabet(...alphabet: AlphabetVPA[]): AlphabetVPA {
    // Union
    let res = alphabet.reduce((prev, curr) => {
      let INT = [...prev.INT, ...curr.INT]
      let CALL = [...prev.CALL, ...curr.CALL]
      let RET = [...prev.RET, ...curr.RET]
      return { INT, CALL, RET }
    }, { INT: [], CALL: [], RET: [] })
    // Remove Duplicata
    res = { INT: [...new Set(res.INT)], CALL: [...new Set(res.CALL)], RET: [...new Set(res.RET)] }
    // Check if it is a disjoint union of three sets
    VPA.isValidAlphabet(res)
    return res
  }

  /** 
   * @throws Error if INT, CALL and RET are not disjoint 
   */
  static isValidAlphabet(alph: AlphabetVPA) {
    let a = new Set([...alph.CALL, ...alph.INT, ...alph.RET])
    if (a.size !== alph.CALL.length + alph.INT.length + alph.RET.length)
      throw new Error("This alphabet is not valid since INT, CALL and RET are not union")
  }

  isDeterministic(): boolean {
    return this.allStates().every(
      state =>
        [...this.alphabet.INT, ...this.alphabet.CALL].
          every(symbol => state.getSuccessor({ symbol }).length <= 1)
        &&
        this.alphabet.RET.
          every(symbol => this.stackAlphabet.
            every(topStack => state.getSuccessor({ symbol, topStack }).length <= 1)))
  }

  flatAlphabet(alph: AlphabetVPA) {
    return ALPH_TYPE_LIST.map(e => alph[e]).flat()
  }

  sameLanguage(aut: VPA): boolean {
    return this.symmetricDifference(aut).isEmpty()
  }

  readWord(word: string): [StateVPA | undefined, boolean] {
    if (word.length === 0)
      return [undefined, this.initialStates.some(e => e.isAccepting)];
    let nextStates: Set<StateVPA> = new Set(this.initialStates);
    for (let index = 0; index < word.length && nextStates.size > 0; index++) {
      let nextStates2: Set<StateVPA> = new Set();
      const symbol = word[index];
      if (!this.alphabet.CALL.includes(symbol) &&
        !this.alphabet.INT.includes(symbol) &&
        !this.alphabet.RET.includes(symbol)) {
        return [undefined, false]
      }
      for (const state of nextStates) {
        try {
          let nextTransition = this.findTransition(state, symbol)
          if (nextTransition)
            for (const nextState of nextTransition) {
              nextStates2.add(nextState)
              if (index === word.length - 1 && nextState.isAccepting) {
                let res = true && this.stack.length === 0
                this.cleanStack()
                return [nextState, res]
              }
            }
        } catch (e) {
          return [nextStates.values().next().value, false]
        }
      }
      nextStates = nextStates2;
    }
    this.cleanStack()
    return [nextStates.values().next().value, false];
  }

  acceptWord(word: string): boolean {
    return this.readWord(word)[1]
  }

  cleanStack() {
    this.stack = []
  }

  isEmpty(): boolean {
    let aut = this.isDeterministic() ? this : this.determinize()
    return aut.allStates().every(e => !e.isAccepting)
  }

  isFull(): boolean {
    let aut = this.isDeterministic() ? this : this.determinize()
    return aut.allStates().every(e => e.isAccepting)
  }

  /**
   * @param state The state from which we start
   * @param symbol The symbol read in the input (if it is RET or CALL 
   * symbol then the top of the stack is taken into account to know 
   * what will be the next state)
   * @returns the list of successors of state 
   */
  findTransition(state: StateVPA, symbol: string): StateVPA[] {
    return state!.getSuccessor({ symbol, topStack: (this.alphabet.RET.includes(symbol) ? this.stack.pop() : undefined), stack: this.stack })!
  }

  acceptingStates(): StateVPA[] {
    return [...this.states.values()].filter(e => e.isAccepting)
  }

  allStates(): StateVPA[] {
    return [...this.states.values()]
  }

  /* istanbul ignore next */
  toDot() {
    let txt = "digraph {rankdir = LR\nfixedsize=true\n"
    let triples: { [id: string]: string[] } = {}
    for (const [name, state] of this.states) {
      let { INT, CALL, RET } = this.alphabet
      let types: ("INT" | "CALL" | "RET")[] = ["INT", "CALL", "RET"]
      for (const type of types) {
        let alph: string[];
        switch (type) {
          case "INT": alph = INT; break;
          case "CALL": alph = CALL; break;
          case "RET": alph = RET; break
        }
        for (let j = 0; j < alph.length; j++) {
          for (let i = 0; i < (type === "RET" ? this.stackAlphabet.length : 1); i++) {
            if (type === "RET") this.stack.push(this.stackAlphabet[i])
            let nextStates = this.findTransition(state, alph[j])
            if (nextStates)
              for (const nextState of nextStates) {
                let stateA_concat_stateB = name + '&' + nextState.name;
                let transDescr;
                switch (type) {
                  case "INT": transDescr = `${alph[j]}`; break;
                  case "CALL": transDescr = `+(${alph[j]},${this.stackAlphabet[i]})`; break;
                  case "RET": transDescr = `-(${alph[j]},${this.stackAlphabet[i]})`; break;
                }
                if (triples[stateA_concat_stateB]) {
                  triples[stateA_concat_stateB].push(transDescr)
                } else {
                  triples[stateA_concat_stateB] = [transDescr]
                }
              }
          }
        }
      }
    }


    let allStates = this.allStates();

    let shape = "circle"

    txt = txt.concat(`node [style=rounded, shape=${shape}, fixedsize=true]\n`);

    txt = txt.concat(Object.keys(triples).map(x => {
      let [states, transition] = [x, triples[x].join(",")]
      let split = states.split("&");
      let A = split[0], B = split[1];
      return `q${toEps(A)} -> q${toEps(B)} [label = "${transition}"]`
    }).join("\n"));

    this.initialStates.forEach(s => {
      txt = txt.concat(`\nI${toEps(s.name)} [label="", style=invis, width=0]\nI${toEps(s.name)} -> q${toEps(s.name)}`);
    });

    // Accepting states
    allStates.forEach(s => {
      if (s.isAccepting)
        txt = txt.concat(`\nq${toEps(s.name)} [peripheries=2]`)
    })

    txt += "\n}"
    return txt
  }

  toString(): String {
    throw todo();
  }
}
