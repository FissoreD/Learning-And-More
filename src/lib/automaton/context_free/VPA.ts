import { todo, toEps } from "../../tools";
import FSM from "../FSM_interface";
import AlphabetVPA, { ALPHABET_TYPE, ALPH_TYPE_LIST } from "./AlphabetVPA";
import { StateVPA } from "./state_vpa";

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
    stateList = [...stateList]
    this.stackAlphabet = stateList[0].stackAlphabet

    this.initialStates = this.allStates().filter(s => s.isInitial);
    if (this.initialStates.length === 0)
      throw new Error("You are creating a VPA with no initial state");
    this.alphabet = new AlphabetVPA().union(...stateList.map(e => e.alphabet));
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
            if (alphType === "RET") this.stack.push(stackAlph[pos])
            let transintion = this.findTransition(state, symbol, alphType)
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

  /**
   * Makes union or intersection of two deterministic VPAs
   * @returns a _deterministic_ VPA
   * @throws an error if one of the two VPA is not deterministic
   */
  private unionOrInter(aut: VPA, operation: "Union" | "Intersection"): VPA {
    let createName = (state1: string, state2: string) => {
      return state1 + state2
    }

    let isAccepting = (s1: StateVPA, s2: StateVPA) =>
      operation === "Union" ?
        (s1.isAccepting || s2.isAccepting) :
        (s1.isAccepting && s2.isAccepting)

    if (this.isDeterministic() && aut.isDeterministic()) {
      /** 
       * The stack alphabet of the new VPA : it is made by the cartesian product
       * of the alphabet of the first automaton and the alphabet of {@link aut},
       * plus each singleton of the stack alphabet of {@link this} and {@link aut}
       */
      let stackAlphabet = this.stackAlphabet.map(s1 =>
        aut.stackAlphabet.map(s2 => createName(s1, s2))).flat();

      /**
       * The alphabet of the new VPA is made by the union of the alphabets
       * of the alphabets of {@link this} and {@link aut}
       */
      let alphabet = this.alphabet.union(aut.alphabet);

      this.complete({ alphabet });
      aut.complete({ alphabet });

      /** Start with the initial states of {@link this} and {@link aut} */
      let initState1 = this.initialStates[0];
      let initState2 = aut.initialStates[0];

      let mapNewStateOldState = new Map<StateVPA, [StateVPA, StateVPA]>();
      let toExplore = [new StateVPA({
        name: createName(initState1.name, initState2.name),
        alphabet, stackAlphabet: stackAlphabet,
        isAccepting: isAccepting(initState1, initState2),
        isInitial: true
      })];
      mapNewStateOldState.set(toExplore[0], [initState1, initState2]);

      let explored = new Set<string>();

      /** 
       * Creates a new states from the two passed in parameter  
       * At least one of them can be undefined  
       * It pushes the new state in the toExplore list if if has
       * not already been explored
       */
      let buildState = (successor1: StateVPA, successor2: StateVPA) => {
        let name = createName(successor1.name, successor2.name)
        let newState = new StateVPA({
          name, alphabet, stackAlphabet,
          isAccepting: isAccepting(successor1, successor2)
        })
        if (!explored.has(name)) {
          mapNewStateOldState.set(newState, [successor1, successor2])
          toExplore.push(newState)
        }
        return newState
      }

      while (toExplore.length) {
        let current = toExplore.pop()!;
        explored.add(current.name);
        let [nextA, nextB] = mapNewStateOldState.get(current)!;
        if (nextA === undefined && nextB === undefined) {
          throw new Error("At least one state should be present")
        } else {
          let outA = nextA.getAllOutTransitions()
          let outB = nextB.getAllOutTransitions()
          let alphAinterB = nextA.alphabet.intersection(nextB.alphabet)

          alphAinterB.INT.forEach(a1 => current.addTransition({
            symbol: a1!,
            successor: buildState(outA.INT[a1][0], outB.INT[a1][0])
          }))

          alphAinterB.CALL.forEach(a1 => current.addTransition({
            symbol: a1!,
            successor: buildState(
              outA.CALL[a1].successors[0],
              outB.CALL[a1].successors[0]),
            topStack: createName(
              outA.CALL[a1].symbolToPush,
              outB.CALL[a1].symbolToPush)
          }))


          alphabet.RET.forEach(ret => {
            nextA.stackAlphabet.forEach(e1 => {
              nextB.stackAlphabet.forEach(e2 => {
                current.addTransition({
                  symbol: ret,
                  successor: buildState(outA.RET[ret][e1][0], outB.RET[ret][e2][0]),
                  topStack: e1 + e2
                })
              })
            })
          })
        }
      }
      // return res.determinize()
      return new VPA([...mapNewStateOldState.keys()])
    }
    throw Error("The union between non deterministic VPA is not implemented");
  }

  union(aut: VPA): VPA {
    return this.unionOrInter(aut, "Union")
  }

  intersection(aut: VPA): VPA {
    return this.unionOrInter(aut, "Intersection")
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
    res.alphabet = alphabet ? new AlphabetVPA().union(...alphabet) : this.alphabet.clone()
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
        [...this.alphabet.INT, ...this.alphabet.CALL].every(symbol => state.getSuccessor({ symbol }).length <= 1)
        &&
        this.alphabet.RET.every(symbol => this.stackAlphabet.every(topStack => state.getSuccessor({ symbol, topStack }).length <= 1))) && this.initialStates.length <= 1
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
  findTransition(state: StateVPA, symbol: string, type?: ALPHABET_TYPE): StateVPA[] {
    return state!.getSuccessor({ symbol, topStack: (this.alphabet.RET.includes(symbol) || type === "RET" ? this.stack.pop() : undefined), stack: this.stack, type })!
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
