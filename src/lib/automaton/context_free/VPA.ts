import ToDot from "../../ToDot.interface";
import { edgeDotStyle, nodeDotRounded, shuffle, todo, toEps } from "../../tools";
import FSM from "../FSM.interface";
import AlphabetVPA from "./AlphabetVPA";
import { VPA_ALPHABET_TYPE, VPA_ALPH_TYPE_LIST } from "./AlphabetVPAType";
import StateVPA from "./StateVPA";

type Grammar = Map<string, Set<string>>
/** A grammar is a map of a rule name linked to a list (set) of productions */

export default class VPA implements FSM, ToDot {
  states: Map<string, StateVPA>;
  initialStates: StateVPA[];
  alphabet: AlphabetVPA;
  stack: string[];
  stackAlphabet: string[];
  grammar: string;


  /** @todo: stack alphabet can be undefined and therefore self-created */
  constructor(stateList: Set<StateVPA> | StateVPA[], grammar = "") {
    this.grammar = grammar
    stateList = new Set(stateList);
    this.states = new Map();
    stateList.forEach(e => this.states.set(e.name, e));
    this.stack = []
    stateList = [...stateList]
    this.stackAlphabet = [...new Set(stateList.flatMap(e => e.stackAlphabet))]

    this.initialStates = this.allStates().filter(s => s.isInitial);
    if (this.initialStates.length === 0)
      throw new Error("You are creating a VPA with no initial state");
    this.alphabet = new AlphabetVPA().union(...stateList.map(e => e.alphabet));
  }

  giveState(word: string): { stateName: string; state: StateVPA; } | undefined {
    return this.readWord(word)[0]
  }

  complete(p?: { bottom?: StateVPA, alphabet?: AlphabetVPA }): VPA {
    let res = this.clone()
    let alphabet = p?.alphabet?.union(res.alphabet) || res.alphabet
    let stackAlph = res.stackAlphabet
    let bottom = p?.bottom || StateVPA.Bottom(alphabet, stackAlph)
    let toAdd = false;
    res.alphabet = alphabet;
    for (const type of VPA_ALPH_TYPE_LIST) {
      for (const symbol of alphabet[type]) {
        for (let pos = 0; pos < (type === "RET" ? stackAlph.length : 1); pos++) {
          let topStack = type === "INT" ? "" : stackAlph[pos]
          bottom.addTransition({ successor: bottom, symbol, topStack })
          for (const state of res.states.values()) {
            let transition = res.findTransition(state, { symbol, type, topStack })
            if (transition === undefined || transition.length === 0) {
              state.addTransition({ type, symbol, topStack, successor: bottom });
              toAdd = true;
            }
          }
        }
      }
    }
    if (toAdd) {
      while (res.states.has(bottom.name))
        bottom.name += "1"
      res.states.set(bottom.name, bottom)
    }
    return res
  }

  determinize(): VPA {
    throw todo();
  }

  /** 
   * @note : the vpa determinization algorithm is not implemented. If the VPA is not deterministic an error will be raised
   */
  minimize(): VPA {
    if (!this.isDeterministic()) {
      throw new Error(`The VPA should be deterministic\nThe automaton is : \n${this.toDot()}`)
    }
    let complete = this.complete()
    let aut = complete.isDeterministic() ? complete : complete.determinize()
    return aut
    /*
    /** List of states reachable from *the* initial state * /
    let stateList = new Set<string>();
    stateList.add(aut.initialStates[0].name)

    /* BFS to remove not reachable node from initial state * /
    let toExplore = [aut.initialStates[0]]

    while (toExplore.length > 0) {
      let newState = toExplore.shift()!

      for (const successor of newState.getAllSuccessors()) {
        if (!stateList.has(successor.name)) {
          toExplore.push(successor)
          stateList.add(successor.name)
        }
      }
    }


    let P: Set<string>[] = [new Set(), new Set()];  /* P := {F, Q \ F} * /
    stateList.forEach(s => {
      (aut.states.get(s)!.isAccepting ? P[0] : P[1]).add(s)
    })
    P = P.filter(p => p.size > 0)

    let pLength = () => P.reduce((a, p) => a + p.size, 0)

    let symbolTopStackList = aut.alphabet.flatAlphabet().flatMap(symbol => (aut.alphabet.RET.includes(symbol) ? aut.stackAlphabet : [""]).map(topStack => ({ symbol, topStack })))

    let W: Set<string>[] = Array.from(P)
    while (W.length > 0) {
      let A = W.shift()!
      for (const symbolTopStack of symbolTopStackList) {
        /* X = the set of states for which a transition on letter leads to a state in A * /
        let X: Set<string> = new Set()
        A.forEach(e => { aut.states.get(e)!.getPredecessor(symbolTopStack)?.forEach(s => X.add(s.name)) })

        /* let {S1 = X ∩ Y; S2 = Y \ X} fotall Y in P * /
        let P1 = P.map(Y => {
          let [X_inter_Y, Y_minus_X] = [new Set<string>(), new Set<string>()];
          Y.forEach(state => X.has(state) ? X_inter_Y.add(state) : Y_minus_X.add(state))
          return { Y, X_inter_Y, Y_minus_X }
        }).filter(({ X_inter_Y, Y_minus_X }) => X_inter_Y.size > 0 && Y_minus_X.size > 0);

        for (const { Y, X_inter_Y, Y_minus_X } of P1) {
          /* replace Y in P by the two sets X ∩ Y and Y \ X * /
          P.splice(P.indexOf(Y), 1)
          P.push(X_inter_Y)
          P.push(Y_minus_X)
          if (pLength() !== stateList.size) throw new Error(`Wanted ${stateList.size} had ${pLength()}`);
          if (W.includes(Y)) {
            W.splice(W.indexOf(Y), 1)
            W.push(X_inter_Y)
            W.push(Y_minus_X)
          } else {
            W.push(X_inter_Y.size <= Y_minus_X.size ? X_inter_Y : Y_minus_X)
          }
        }
      }
    }


    let oldStateToNewState: Map<string, StateVPA> = new Map();

    let newStates = new Set([...P].filter(partition => partition.size > 0).map((partition, _pos) => {
      let representant: StateVPA[] = [...partition].map(e => aut.states.get(e)!);
      let newState = new StateVPA({
        name: representant.map(e => e.name).join(","), // change with pos ?
        isAccepting: representant.some(e => e.isAccepting),
        isInitial: representant.some(e => e.isInitial),
        alphabet: representant[0].alphabet, stackAlphabet: complete.stackAlphabet
      })
      partition.forEach(state => oldStateToNewState.set(state, newState))
      return newState;
    }));

    for (const partition of P) {
      for (const oldState of partition) {
        for (const alphabetType of ALPH_TYPE_LIST) {
          for (let i = 0; i < (alphabetType === "INT" ? 1 : complete.stackAlphabet.length); i++) {
            for (const symbol of complete.alphabet[alphabetType]) {
              let topStack = (alphabetType === "INT" ? "" : complete.stackAlphabet[i])
              let newState = oldStateToNewState.get(oldState)!
              let successorNewState = this.findTransition(newState, { symbol, topStack })!;

              for (const successor of this.findTransition(aut.states.get(oldState)!, { symbol, topStack })) {
                let successorOldState = oldStateToNewState.get(successor.name)
                // @todo
                if (!successorNewState || !successorNewState[0] ||
                  (successorNewState[0].name !== successorOldState!.name))
                  newState!.addTransition({ symbol, successor: successorOldState!, topStack })
              }
            }
          }
        }
      }
    }
    let res = new VPA(newStates)
    console.assert(res.isDeterministic())
    return res
    */
  }

  /**
   * Makes union or intersection of two deterministic VPAs
   * @returns a _deterministic_ VPA
   * @throws an error if one of the two VPA is not deterministic
   */
  private makeOperation(aut: VPA, operation: "Union" | "Intersection" | "SymDiff" | "Diff"): VPA {
    let isAccepting = (s1: StateVPA, s2: StateVPA) => {
      switch (operation) {
        case "Diff": return s1.isAccepting && !s2.isAccepting
        case "Union": return s1.isAccepting || s2.isAccepting
        case "Intersection": return s1.isAccepting && s2.isAccepting
        case "SymDiff": return s1.isAccepting !== s2.isAccepting
      }
    }

    if (!this.isDeterministic || !aut.isDeterministic)
      throw Error("The union between non deterministic VPA is not implemented");

    /**
     * The stack alphabet of the new VPA : it is made by the cartesian product
     * of the alphabet of the first automaton and the alphabet of {@link aut},
     * plus each singleton of the stack alphabet of {@link this} and {@link aut}
     */
    let stackAlphabet = this.stackAlphabet.map(s1 =>
      aut.stackAlphabet.map(s2 => s1 + s2)).flat();

    /**
     * The alphabet of the new VPA is made by the union of the alphabets
     * of the alphabets of {@link this} and {@link aut}
     */
    let alphabet = this.alphabet.union(aut.alphabet);

    let a1 = this.complete({ alphabet });
    let a2 = aut.complete({ alphabet });

    /* Start with the initial states of a1 and a2 */
    let initState1 = a1.initialStates[0];
    let initState2 = a2.initialStates[0];

    let mapNewStateOldState = new Map<string, [StateVPA, StateVPA]>();
    let mapNewStateNameState = new Map<string, StateVPA>()
    let startState = new StateVPA({
      name: toEps(initState1.name) + toEps(initState2.name),
      alphabet, stackAlphabet: stackAlphabet,
      isAccepting: isAccepting(initState1, initState2),
      isInitial: true
    });
    let toExplore = new Set([startState]);
    mapNewStateOldState.set(startState.name, [initState1, initState2]);
    mapNewStateNameState.set(startState.name, startState)

    let explored = new Set<string>();

    /** 
     * Creates a new states from the two passed in parameter  
     * At least one of them can be undefined  
     * It pushes the new state in the toExplore list if if has
     * not already been explored
     */
    let buildState = (successor1: StateVPA, successor2: StateVPA) => {
      let name = toEps(successor1.name) + toEps(successor2.name)
      let newState = mapNewStateNameState.get(name) || new StateVPA({
        name, alphabet, stackAlphabet,
        isAccepting: isAccepting(successor1, successor2)
      })
      if (!explored.has(name)) {
        mapNewStateOldState.set(newState.name, [successor1, successor2])
        mapNewStateNameState.set(newState.name, newState)
        toExplore.add(newState)
      }
      return newState
    }

    while (toExplore.size) {
      let current = toExplore.keys().next().value! as StateVPA;
      if (!toExplore.delete(current))
        throw new Error("Should delete an item from the set")
      explored.add(current.name);

      let [nextA, nextB] = mapNewStateOldState.get(current.name)!;
      if (nextA === undefined || nextB === undefined) {
        throw new Error("At least one state should be present")
      } else {
        let outA = nextA.getAllOutTransitions()
        let outB = nextB.getAllOutTransitions()

        alphabet.INT.forEach(a1 => current.addTransition({
          symbol: a1!,
          successor: buildState(outA.INT[a1][0], outB.INT[a1][0])
        }))

        alphabet.CALL.forEach(a1 => current.addTransition({
          symbol: a1!,
          successor: buildState(
            outA.CALL[a1].successors[0],
            outB.CALL[a1].successors[0]),
          topStack: (
            outA.CALL[a1].symbolToPush +
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
    // TODO : pass the new grammar in parameter ?
    return new VPA([...mapNewStateNameState.values()])
  }

  union(aut: VPA): VPA {
    return this.makeOperation(aut, "Union")
  }

  intersection(aut: VPA): VPA {
    return this.makeOperation(aut, "Intersection")
  }

  difference(aut: VPA): VPA {
    return this.makeOperation(aut, "Diff")
  }

  symmetricDifference(aut: VPA): VPA {
    return this.makeOperation(aut, "SymDiff");
  }

  clone(): VPA {
    let allStates = this.allStates()
    let myMap = new Map(allStates.map(e => [e, e.clone()]))
    let res = new VPA([...myMap.values()], this.grammar);

    myMap.forEach((newS, oldS) => {

      this.alphabet.INT.forEach(symbol =>
        this.findTransition(oldS, { symbol }).forEach(succ => {
          newS.addTransition({
            symbol,
            successor: myMap.get(succ)!
          })
        }));

      this.alphabet.CALL.forEach(symbol => {
        try {
          let { successors, symbolToPush } = oldS.getAllOutTransitions().CALL[symbol]
          successors.forEach(succ => {
            newS.addTransition({
              symbol,
              successor: myMap.get(succ)!,
              topStack: symbolToPush
            })
          })
        } catch (e) { }
      });

      this.alphabet.RET.forEach(symbol =>
        this.stackAlphabet.forEach(topStack =>
          (this.findTransition(oldS, { symbol, topStack, type: "RET" }) || []).forEach(succ => newS.addTransition({
            symbol,
            successor: myMap.get(succ)!,
            topStack
          }))))
    })
    return res;
  }

  complement(...alphabet: AlphabetVPA[]): VPA {
    let res = this.complete({ alphabet: this.alphabet.union(...alphabet) })

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

  isDeterministic(): boolean {
    let { INT, CALL, RET } = this.alphabet
    return this.allStates().every(
      state => {
        let intIsDeterministic = INT.every(symbol =>
          this.findTransition(state, { symbol }).length <= 1)
        let callIsDeterministic = CALL.every(symbol =>
          this.findTransition(state, { symbol }).length <= 1)
        let retIsDeterministic =
          RET.every(symbol =>
            this.stackAlphabet.every(topStack =>
              this.findTransition(state, { symbol, topStack }) === undefined ||
              this.findTransition(state, { symbol, topStack }).length <= 1)
          )
        if (!intIsDeterministic) {
          throw new Error(`Int is not deterministic\n${this.toDot()}\nIn state: "${state.name}"`)
        } else if (!callIsDeterministic) {
          throw new Error(`Call is not deterministic\n${this.toDot()}\nIn state: "${state.name}"`)
        }
        if (!retIsDeterministic) {
          throw new Error(`Ret is not deterministic\n${this.toDot()}\nIn state: "${state.name}"`)
        }
        return intIsDeterministic && callIsDeterministic && retIsDeterministic
      }) && this.initialStates.length <= 1
  }

  sameLanguage(aut: VPA): boolean {
    return this.symmetricDifference(aut).isEmpty()
  }

  readWord(word: string): [{ stateName: string; state: StateVPA; } | undefined, boolean] {
    let stackToString = (...stack: string[]) => {
      return stack.join().replace(/([^\x00-\x7F]|\(|\)|,)/g, "")
    }
    if (word.length === 0) {
      let state = this.initialStates.find(e => e.isAccepting) || this.initialStates[0]
      return [{ state, stateName: "" }, this.initialStates.some(e => e.isAccepting)];
    }
    let nextStates: Set<StateVPA> = new Set(this.initialStates);
    let stack: string[] = []

    let flatAlphabet = this.alphabet.flatAlphabet()

    let findSymbol = () => flatAlphabet.find(e => word.startsWith(e))

    while (nextStates.size) {
      let symbol = findSymbol()
      if (symbol === undefined) {
        return [undefined, false]
      }

      word = word.substring(symbol.length)

      let nextStates2: Set<StateVPA> = new Set();
      for (const state of nextStates) {
        try {
          let nextTransition = this.findTransition(state, { symbol, stack })
          if (nextTransition)
            for (const nextState of nextTransition) {
              nextStates2.add(nextState)
              if (word.length === 0) {
                if (nextState.isAccepting) {
                  let res = stack.length === 0
                  return [{ stateName: stackToString(...stack) + (this.alphabet.INT.includes(symbol) ? stackToString(nextState.name) : ""), state: nextState }, res]
                } else {
                  return [{ stateName: stackToString(...stack) + (this.alphabet.INT.includes(symbol) ? stackToString(nextState.name) : ""), state: nextState }, false]
                }
              }
            }
        } catch (e) {
          return [{ stateName: stackToString(...stack), state: [...nextStates][0] }, false]
        }

        if (word.length === 0) {
          return [{ stateName: stackToString(...stack), state: [...nextStates][0] }, false]
        }
      }
      nextStates = nextStates2;
    }
    return [{ stateName: stackToString(...stack), state: [...nextStates][0] }, false];
  }

  acceptWord(word: string): boolean {
    return this.readWord(word)[1]
  }

  cleanStack() {
    this.stack = []
  }

  isEmpty(): boolean {
    return this.allStates().every(e => !e.isAccepting) || !this.toGrammarar()
  }

  isFull(): boolean {
    return this.complement().isEmpty()
  }

  /**
   * @param state The state from which we start
   * @param p.symbol The symbol read in the input (if it is RET or CALL 
   * symbol then the top of the stack is taken into account to know 
   * what will be the next state)
   * @returns the list of successors of state 
   */
  findTransition(state: StateVPA, p: { type?: VPA_ALPHABET_TYPE, symbol: string, topStack?: string, stack?: string[] }): StateVPA[] {
    return state!.getSuccessor(p)!
  }

  acceptingStates(): StateVPA[] {
    return [...this.states.values()].filter(e => e.isAccepting)
  }

  allStates(): StateVPA[] {
    return [...this.states.values()]
  }

  /* istanbul ignore next */
  toDot() {
    // let txt = "digraph {rankdir = LR\nfixedsize=true\n"
    let txt = "digraph {rankdir = LR\n"
    let triples: { [id: string]: string[] } = {}
    let allStates = this.allStates().sort((a, b) => a.isInitial ? -1 : 1);
    for (const state of allStates) {
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
            let nextStates = this.findTransition(state, { symbol: alph[j], topStack: type === "INT" ? "" : this.stackAlphabet[i], type })
            if (nextStates)
              for (const nextState of nextStates) {
                let stateA_concat_stateB = state.name + '&' + nextState.name;
                let transDescr;
                switch (type) {
                  case "INT": transDescr = `${alph[j]}`; break;
                  case "CALL": transDescr = `+(${alph[j]},${state.getAllOutTransitions().CALL[alph[j]].symbolToPush})`; break;
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

    let legend = ""

    // txt = txt.concat(`node [style=rounded, shape=${shape}, fixedsize=true]\n`);
    txt = txt.concat(nodeDotRounded);
    txt = txt.concat(edgeDotStyle);

    txt = txt.concat(Object.keys(triples).map(x => {
      let [states, transition] = [x, triples[x].join(",")]
      let split = states.split("&");
      let A = split[0], B = split[1];
      legend = legend + `${toEps(A)} -> ${toEps(B)} := ${transition}\\n`
      // return `"${toEps(A)}" -> "${toEps(B)}" [tooltip="${transition}"]`
      return `"${toEps(A)}" -> "${toEps(B)}" [label="${transition}"]`
    }).join("\n"));

    this.initialStates.forEach(s => {
      txt = txt.concat(`\n"I${toEps(s.name)}" [label="", style=invis, width=0]\n"I${toEps(s.name)}" -> "${toEps(s.name)}"`);
    });

    /* Accepting states */
    allStates.forEach(s => {
      if (s.isAccepting)
        txt = txt.concat(`\n"${toEps(s.name)}" [peripheries=2]`)
    })

    // txt += `\nlabel="${legend}"`

    txt += "\n}"
    // console.log(txt);

    return txt
  }

  toString(): string {
    return this.toDot()
  }

  findWordAccepted(minLength = 0) {
    let { INT, CALL, RET } = this.alphabet;

    let aut = this.clone()

    if (aut.isEmpty()) return undefined;

    let acceptedWords: string[] = []
    type exploreType = {
      state: StateVPA; word: string; callNumber: number; stack: string[];
      canPushOnStack: boolean /* Note: this last property is because the stack once empty cannot be reused */
    }[]
    let toExplore: exploreType = [...aut.initialStates].map(state => ({ state, word: "", callNumber: 0, stack: [], canPushOnStack: true }))

    if (aut.initialStates.some(e => e.isAccepting))
      acceptedWords.push("")

    if (minLength === 0 && acceptedWords.length)
      return ""


    let start = performance.now()
    while (toExplore.length) {
      if (performance.now() > start + 100) {
        throw new Error("Should be empty !!\n" + aut.toDot())
      }
      let newToExplore: exploreType = []
      for (const { state, word, stack, callNumber, canPushOnStack } of toExplore) {
        /** RET */
        for (const symbol of RET) {
          if (callNumber === 0) break;
          let stackClone = [...stack]

          let successors = this.findTransition(state, { symbol, stack: stackClone })
          if (successors) {
            for (const state of successors) {
              if (!state.isAccepting &&
                state.getAllSuccessors().size === 1 &&
                state.getAllSuccessors().has(state)) { continue }
              let newWord = word + symbol;
              if (state.isAccepting && callNumber === 1) {
                acceptedWords.push(newWord);
                if (newWord.length >= minLength) return newWord;
              }
              newToExplore.push({ state, word: newWord, stack: stackClone, callNumber: callNumber - 1, canPushOnStack: callNumber !== 1 });
            }
          }
        }
        /** CALL */
        for (const symbol of CALL) {
          if (!canPushOnStack) break
          let stackClone = [...stack]
          let successors = this.findTransition(state, { symbol, stack: stackClone })
          if (successors) {
            for (const state of successors) {
              if (!state.isAccepting &&
                state.getAllSuccessors().size === 1 &&
                state.getAllSuccessors().has(state)) { continue }
              let newWord = word + symbol;
              newToExplore.push({ state, word: newWord, stack: stackClone, callNumber: callNumber + 1, canPushOnStack });
            }
          }
        }
        /** INT */
        for (const symbol of INT) {
          let successors = this.findTransition(state, { symbol, stack })
          if (successors) {
            for (const state of successors) {
              if (!state.isAccepting &&
                state.getAllSuccessors().size === 1 &&
                state.getAllSuccessors().has(state)) { continue }
              let newWord = word + symbol;
              if (state.isAccepting && callNumber === 0) {
                acceptedWords.push(newWord);
                if (newWord.length >= minLength) return newWord;
              }
              newToExplore.push({ state, word: newWord, stack, callNumber, canPushOnStack });
            }
          }
        }
      }
      if (newToExplore.length === 0) break;
      toExplore = shuffle(newToExplore);
    }
    return toExplore.reduce((old, n) => n.word.length > old.length ? n.word : old, acceptedWords[acceptedWords.length - 1]);
  }

  toGrammarar() {

    let exitingState = "qn"
    let freshSymbolStack = "Z"

    let aut = this.clone()

    aut.acceptingStates().forEach(state => {
      state.addTransition({ successor: state, symbol: "$", topStack: freshSymbolStack, type: "RET" })
    })

    let stateNames: string[] = [], states: StateVPA[] = []
    aut.states.forEach((value, key) => { stateNames.push(key); states.push(value) })
    let grammar: Grammar = new Map()
    let rulesToTerminal: Set<string> = new Set()
    grammar.set("S", new Set())

    let makeRuleName = (a: string, b: string, c: string) => `{${a}${b}${c}}`

    grammar.get("S")?.add(
      `${makeRuleName(this.initialStates[0].name, freshSymbolStack, exitingState)}`
    )

    states.forEach(state => {
      let { INT, CALL, RET } = state.getAllOutTransitions()
      aut.alphabet.INT.forEach(symbol => {
        aut.stackAlphabet.concat(freshSymbolStack).forEach(topStack => {
          let successors = INT[symbol]
          if (successors && successors.length) {
            let succ = successors[0]
            for (const succ1 of stateNames.concat(exitingState)) {
              let key = makeRuleName(state.name, topStack, succ1)
              let ruleSet = grammar.get(key) || new Set()
              ruleSet.add(`${symbol}${makeRuleName(succ.name, topStack, succ1)}`)
              grammar.set(key, ruleSet)
            }
          }
        })
      });
      aut.alphabet.RET.forEach(symbol => {
        aut.stackAlphabet.forEach(topStack => {
          try {
            let successors = RET[symbol][topStack]

            if (successors && successors.length) {
              let succ = successors[0]
              let key = makeRuleName(state.name, topStack, succ.name)
              let ruleSet = grammar.get(key) || new Set()
              ruleSet.add(`${symbol}`)
              grammar.set(key, ruleSet)
              rulesToTerminal.add(key)
            }
          } catch (_) { }
        })
      });

      let predSymbol = [...new Set([...state.predecessors].flatMap(pred => {
        let validTransition = aut.alphabet.CALL.filter(e => pred.outTransitions.CALL[e] && pred.outTransitions.CALL[e].successors.includes(state))
        return validTransition.map(e => pred.outTransitions.CALL[e].symbolToPush)
      }))]

      aut.alphabet.CALL.forEach(symbol => {
        let { successors, symbolToPush: topStack } = CALL[symbol]
        if (successors && successors.length) {
          let succ = successors[0].name;
          for (const xxx of [...predSymbol, topStack, freshSymbolStack]) {
            for (const succ1 of stateNames) {
              for (const succ2 of stateNames.concat(exitingState)) {
                if (succ2 === exitingState && state.name !== aut.initialStates[0].name)
                  continue
                let key = makeRuleName(state.name, xxx, succ2);
                let ruleSet = grammar.get(key) || new Set();
                ruleSet.add(`${symbol}${makeRuleName(succ, topStack, succ1)}${makeRuleName(succ1, xxx, succ2)}`)
                grammar.set(key, ruleSet);
              }
            }
          }
        }
      })
    });

    aut.acceptingStates().forEach(state => {
      let key = makeRuleName(state.name, freshSymbolStack, exitingState)
      let ruleSet = grammar.get(key) || new Set()
      ruleSet.add(``)
      grammar.set(key, ruleSet)
    })

    /* Simplify rules : (A -> terminal | R) =: (A -> terminal) */
    let simplifyTerminal = () => {
      for (const [key, values] of grammar) {
        let valuesList = [...values]
        let terminal = valuesList.find(e => !e.match(/{[^{}]*}/g))
        if (terminal) {
          grammar.set(key, new Set([terminal]))
          continue
        }
      }
    }

    /** simplify recursive Rules of type A → A | x := A → x */
    let removeRecursiveRule = () => {
      for (const [key, values] of grammar) {
        let valuesList = [...values]
        let next = valuesList.filter(e => e.includes(key))
        next.forEach(e => grammar.get(key)!.delete(e))
      }
    }

    let removeEmptyRule = () => {
      for (const key of [...grammar.keys()]) {
        if (grammar.get(key)?.size === 0) grammar.delete(key)
      }
    }

    /** Remove useless symbols */
    function cleanGrammar() {
      if (!grammar.has("S")) return
      for (const [key, values] of [...grammar]) {
        for (const value of values) {
          let split = value.match(/{[^{}]*}/g)
          if (split === null) continue
          for (const sub of split) {
            if (!grammar.has(sub)) {
              let set = grammar.get(key)!
              set.delete(value)
              if (set.size === 0) {
                grammar.delete(key)
                break
              }
            }
          }
        }
      }
    }

    /** Replace rules on the form A → x | G := A → x */
    let replaceTerminalInG = () => {
      let grammarCopy = [...grammar]

      let terminals = grammarCopy.filter(
        ([_, values]) => [...values].some(e => !e.match(/{[^{}]*}/g))
      ).map(([key, value]) => [key, [...value].find(e => !e.match(/{[^{}]*}/g))!])

      grammarCopy.forEach(([_, values]) => {
        terminals.map(([key, terminal]) => [...values].forEach(v => {
          if (v.includes(key)) {
            values.delete(v);
            values.add(v.replace(key, terminal))
          }
        }))
      })
      terminals.forEach(([key, _]) => {
        if (key !== "S")
          grammar.delete(key)
      })
    }

    let counter = 0

    removeRecursiveRule()

    let simplifyGrammar = () => {
      let oldSize = grammar.size
      cleanGrammar()
      removeEmptyRule()
      replaceTerminalInG()
      removeEmptyRule()
      simplifyTerminal()
      if (print) console.log(grammar);
      if (counter === 0 && print)
        throw new Error("STOP")
      counter++;

      if (grammar.size !== oldSize) {
        simplifyGrammar()
      }
    }

    let print = false;

    if (print) console.log(grammar);
    simplifyGrammar()
    // console.log(grammar.get("S"));

    return grammar.has("S") && [...grammar.get("S")!].some(e => !e.match(/{[^{}]*}/g))
  }
}
