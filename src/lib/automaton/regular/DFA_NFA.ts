import ToDot from "../../ToDot.interface";
import { edgeDotStyle, nodeDotRounded, sameVector, shuffle, toEps } from "../../tools";
import FSM from "../FSM.interface";
import AlphabetDFA from "./AlphabetDFA";
import regexToAutomaton from "./parser/RegexParser";
import StateDFA from "./StateDFA";

export default class DFA_NFA implements FSM, ToDot {
  states: Map<string, StateDFA>;
  initialStates: StateDFA[];
  alphabet: AlphabetDFA;
  grammar: string;

  constructor(stateList: Set<StateDFA> | StateDFA[], grammar = "") {
    stateList = new Set(stateList);
    this.grammar = grammar
    this.states = new Map();
    stateList.forEach(e => this.states.set(e.name, e));

    this.initialStates = this.allStates().filter(s => s.isInitial);
    this.alphabet = new AlphabetDFA().union(...[...stateList].map(e => e.alphabet).flat());
  }

  complete(p?: { bottom?: StateDFA, alphabet?: AlphabetDFA }) {
    let res = this.clone()
    let alphabet = p?.alphabet?.union(res.alphabet) || res.alphabet;
    let bottom = p?.bottom || StateDFA.Bottom(alphabet)
    let toAdd = false;
    res.alphabet = alphabet
    for (const symbol of alphabet.symbols) {
      bottom.addTransition(symbol, bottom);
      for (const state of res.states.values()) {
        let transintion = res.findTransition(state, { symbol })
        if (transintion === undefined || transintion.length === 0) {
          state.addTransition(symbol, bottom);
          toAdd = true;
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

  private makeOperation(aut: DFA_NFA, operation: "Union" | "Intersection" | "SymDiff" | "Diff"): DFA_NFA {
    let isAccepting = (s1: StateDFA, s2: StateDFA) => {
      switch (operation) {
        case "Diff": return s1.isAccepting && !s2.isAccepting
        case "Union": return s1.isAccepting || s2.isAccepting
        case "Intersection": return s1.isAccepting && s2.isAccepting
        case "SymDiff": return s1.isAccepting !== s2.isAccepting
      }
    }

    let a1 = this.isDeterministic() ? this : this.determinize()
    aut = aut.isDeterministic() ? aut : aut.determinize()

    /**
     * The alphabet of the new VPA is made by the union of the alphabets
     * of the alphabets of {@link a1} and {@link aut}
     */
    let alphabet = a1.alphabet.union(aut.alphabet);

    a1 = a1.complete({ alphabet });
    aut = aut.complete({ alphabet });

    /** Start with the initial states of {@link a1} and {@link aut} */
    let initState1 = a1.initialStates[0];
    let initState2 = aut.initialStates[0];

    let mapNewStateOldState = new Map<string, [StateDFA, StateDFA]>();
    let mapNewStateNameState = new Map<string, StateDFA>()
    let startState = new StateDFA(initState1.name + initState2.name,
      isAccepting(initState1, initState2),
      true, alphabet);
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
    let buildState = (successor1: StateDFA, successor2: StateDFA) => {
      let name = successor1.name + successor2.name
      let newState = mapNewStateNameState.get(name) || new StateDFA(
        name, isAccepting(successor1, successor2),
        false, alphabet
      )
      if (!explored.has(name)) {
        mapNewStateOldState.set(newState.name, [successor1, successor2])
        mapNewStateNameState.set(newState.name, newState)
        toExplore.add(newState)
      }
      return newState
    }

    while (toExplore.size) {
      let current = toExplore.keys().next().value! as StateDFA;
      if (!toExplore.delete(current))
        throw new Error("Should delete an item from the set")
      explored.add(current.name);

      let [nextA, nextB] = mapNewStateOldState.get(current.name)!;
      if (nextA === undefined || nextB === undefined) {
        throw new Error("At least one state should be present")
      } else {
        let outA = nextA.getAllOutTransitions()
        let outB = nextB.getAllOutTransitions()

        alphabet.symbols.forEach(a1 => current.addTransition(
          a1!, buildState(outA.get(a1)![0], outB.get(a1)![0])
        ))
      }
    }
    return new DFA_NFA([...mapNewStateNameState.values()])
  }

  readWord(word: string): [{ stateName: string; state: StateDFA; } | undefined, boolean] {
    if (word.length === 0) {
      let state = (this.initialStates.find(e => e.isAccepting) || this.initialStates[0])
      return [{ state, stateName: state.name }, this.initialStates.some(e => e.isAccepting)];
    }
    let nextStates: Set<StateDFA> = new Set(this.initialStates);

    let findSymbol = () => this.alphabet.symbols.find(e => word.startsWith(e))
    while (word.length && nextStates.size) {
      let symbol = findSymbol()

      if (symbol === undefined) {
        return [undefined, false]
      }

      word = word.substring(symbol.length)
      let nextStates2: Set<StateDFA> = new Set();
      if (!this.alphabet.symbols.includes(symbol)) {
        return [undefined, false]
      }
      for (const state of nextStates) {
        let nextTransition = this.findTransition(state, { symbol })
        if (nextTransition)
          for (const nextState of nextTransition) {
            nextStates2.add(nextState)
            if (word.length === 0 && nextState.isAccepting)
              return [{ state: nextState, stateName: nextState.name }, true]
          }
        // Array.from(this.findTransition(state, symbol)).forEach(e => nextStates2.add(e))
      }
      nextStates = nextStates2;
    }
    let state = [...nextStates][0]
    return [{ state, stateName: state?.name }, false];
  }

  giveState(word: string): { stateName: string; state: StateDFA; } | undefined {
    return this.readWord(word)[0]
  }

  acceptWord(word: string): boolean {
    return this.readWord(word)[1]
  }

  findTransition(state: StateDFA, p: { symbol: string }) {
    return state!.getSuccessor(p.symbol)!
  }

  /* istanbul ignore next */
  toDot() {
    let symbols = this.alphabet.symbols
    let txt = "digraph {rankdir = LR\nfixedsize=true\n"
    let triples: { [id: string]: string[] } = {}

    let allStates = this.allStates().sort((a,) => a.isInitial ? -1 : 1);
    // If it contains some States, they will not appear in the dot rendering
    let bottoms: StateDFA[] = []; //allStates.filter(s => s.isBottom())

    for (const state of allStates) {
      if (bottoms.includes(state)) /* ignore bottom state */
        continue
      for (const symbol of symbols) {
        for (const nextState of this.findTransition(state, { symbol })) {
          if (bottoms.includes(nextState)) /* ignore bottom state */
            continue
          let stateA_concat_stateB = state.name + '&' + nextState.name;
          if (triples[stateA_concat_stateB]) {
            triples[stateA_concat_stateB].push(symbol)
          } else {
            triples[stateA_concat_stateB] = [symbol]
          }
        }
      }
    }

    txt = txt.concat(nodeDotRounded);
    txt = txt.concat(edgeDotStyle);

    txt = txt.concat(Object.keys(triples).map(x => {
      let [states, transition] = [x, triples[x].join(",")]
      let split = states.split("&");
      let A = split[0], B = split[1];
      return `"${toEps(A)}" -> "${toEps(B)}" [label = "${transition}"]`
    }).join("\n"));

    this.initialStates.forEach(s => {
      txt = txt.concat(`\n"I${toEps(s.name)}" [label="", style=invis, width=0]\n"I${toEps(s.name)}" -> "${toEps(s.name)}"`);
    });

    /* Accepting states */
    allStates.forEach(s => {
      if (s.isAccepting)
        txt = txt.concat(`\n"${toEps(s.name)}" [peripheries=2]`)
    })

    txt += "\n}"
    return txt
  }

  acceptingStates() {
    return this.allStates().filter(s => s.isAccepting);
  }

  getStateNumber() {
    return this.states.size;
  }

  getTransitionNumber() {
    return Array.from(this.states).map(([_, e]) => e.getOutTransitionNumber()).reduce((a, b) => a + b, 0)
  }

  isDeterministic(): boolean {
    return this.allStates().every(e => this.alphabet.symbols.every(l => e.getSuccessor(l) === undefined || e.getSuccessor(l).length === 1)) && this.initialStates.length <= 1
  }

  /** 
   * @returns a fresh Determinized Automaton 
   */
  determinize(): DFA_NFA {
    let aut = this.complete()
    let allStates = this.allStates()
    let newStates = new Map<string, StateDFA>();
    let stateMap = new Map(allStates.map((e, pos) => [e.name, pos]))

    let initState = [...aut.initialStates].sort((a, b) => stateMap.get(a.name)! - stateMap.get(b.name)!);
    let toTreat = [initState.map(e => stateMap.get(e.name)!)];

    let findState = (n: number[]) => newStates.get(JSON.stringify(n))!;
    let addState = (name: number[], isInitial = false) =>
      newStates.set(JSON.stringify(name),
        new StateDFA(JSON.stringify(name),
          name.some(e => allStates[e].isAccepting),
          isInitial, aut.alphabet));
    let addSuccessor = (current: number[], letter: string, successor: number[]) =>
      findState(current).addTransition(letter, findState(successor));

    addState(toTreat[0], true);

    let done: number[][] = []
    while (toTreat.length > 0) {
      let current = toTreat.shift()!;
      done.push(current)
      for (const letter of aut.alphabet.symbols) {
        let successor = [...new Set(current.map(e => allStates[e].getSuccessor(letter)).flat())].map(e => stateMap.get(e.name)!).sort();

        if (newStates.has(JSON.stringify(successor))) {
          addSuccessor(current, letter, successor);
        } else {
          addState(successor)
          addSuccessor(current, letter, successor);
        }
        if (!done.some(e => sameVector(e, successor))) {
          toTreat.push(successor)
        }
      }
    }
    let res = new DFA_NFA([...newStates.values()], this.grammar)
    return res
  }

  minimize(): DFA_NFA {
    let aut = this.complete()
    aut = aut.isDeterministic() ? aut : aut.determinize()

    /** List of states reachable from *the* initial state */
    let stateList = new Set<string>();
    stateList.add(aut.initialStates[0].name)

    /* BFS to remove not reachable node from initial state */
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

    let P: Set<string>[] = [new Set(), new Set()];  /* P := {F, Q \ F} */
    stateList.forEach(s => {
      (aut.states.get(s)!.isAccepting ? P[0] : P[1]).add(s)
    })
    P = P.filter(p => p.size > 0)

    let pLength = () => P.reduce((a, p) => a + p.size, 0)

    let W: Set<string>[] = Array.from(P)
    while (W.length > 0) {
      let A = W.shift()!
      for (const letter of aut.alphabet.symbols) {
        /* X = the set of states for which a transition on letter leads to a state in A */
        let X: Set<string> = new Set()
        A.forEach(e => { aut.states.get(e)!.getPredecessor(letter)?.forEach(s => X.add(s.name)) })

        /* let {S1 = X ∩ Y; S2 = Y \ X} fotall Y in P */
        let P1 = P.map(Y => {
          let [X_inter_Y, Y_minus_X] = [new Set<string>(), new Set<string>()];
          Y.forEach(state => X.has(state) ? X_inter_Y.add(state) : Y_minus_X.add(state))
          return { Y, X_inter_Y, Y_minus_X }
        }).filter(({ X_inter_Y, Y_minus_X }) => X_inter_Y.size > 0 && Y_minus_X.size > 0);

        for (const { Y, X_inter_Y, Y_minus_X } of P1) {
          /* replace Y in P by the two sets X ∩ Y and Y \ X */
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

    let oldStateToNewState: Map<string, StateDFA> = new Map();

    let newStates = new Set([...P].filter(partition => partition.size > 0).map((partition, pos) => {
      let representant: StateDFA[] = [...partition].map(e => aut.states.get(e)!);
      let newState = new StateDFA(pos + "",
        representant.some(e => e.isAccepting),
        representant.some(e => e.isInitial),
        representant[0].alphabet
      )
      partition.forEach(state => oldStateToNewState.set(state, newState))
      return newState;
    }));

    for (const partition of P) {
      for (const oldState of partition) {
        for (const letter of aut.alphabet.symbols) {
          for (const successor of aut.states.get(oldState)!.getSuccessor(letter)) {
            if (!oldStateToNewState.get(oldState)!.getSuccessor(letter)![0] ||
              (oldStateToNewState.get(oldState)!.getSuccessor(letter)![0].name !== oldStateToNewState.get(successor.name)!.name))
              oldStateToNewState.get(oldState)!.addTransition(letter, oldStateToNewState.get(successor.name)!)
          }
        }
      }
    }

    let res = new DFA_NFA(newStates, this.grammar)
    return res;
  }

  clone(alphabet?: AlphabetDFA) {
    let allStates = this.allStates()
    let res = new DFA_NFA(allStates.map(e => e.clone({ alphabet })), this.grammar);
    this.alphabet.symbols.forEach(l =>
      allStates.forEach((e, pos) =>
        e.getSuccessor(l).forEach(succ => res.allStates()[pos].addTransition(l, res.allStates()[allStates.indexOf(succ)]))
      ))
    return res;
  }

  union(aut: DFA_NFA): DFA_NFA {
    return this.makeOperation(aut, "Union")
  }

  intersection(aut: DFA_NFA): DFA_NFA {
    return this.makeOperation(aut, "Intersection")
  }

  difference(aut: DFA_NFA): DFA_NFA {
    return this.makeOperation(aut, "Diff")
  }

  symmetricDifference(aut: DFA_NFA): DFA_NFA {
    return this.makeOperation(aut, "SymDiff")
  }

  isEmpty() {
    let aut = this.minimize()
    return aut.allStates().every(e => !e.isAccepting)
  }

  /** @returns if the automaton is the universal automaton */
  isFull() {
    let aut = this.isDeterministic() ? this : this.determinize()
    return aut.allStates().every(e => e.isAccepting)
  }

  sameLanguage(aut: DFA_NFA) {
    return this.symmetricDifference(aut).isEmpty()
  }

  complement(alphabet?: AlphabetDFA) {
    let res = this.complete();
    res.alphabet = alphabet ? res.alphabet.union(alphabet) : res.alphabet.clone()

    if (!res.isDeterministic()) {
      res = this.determinize();
    }
    res.allStates().forEach(e => {
      e.isAccepting = !e.isAccepting
    });
    return res;
  }

  /**
   * Transform a String to an Automaton
   * @param content -> It must be on the form  
   *        Q1  
   *        ...  
   *        Qn  
   *        a0,[Qi]->[Qj]  
   *        ...  
   *        an,[Ql]->[Qm]  
   *        Qa  
   *        ...  
   *        Qz  
   * where  
   * - [Q1 ... Qn] are the initials states
   * - [a0,[Qi]->[Qj] ... an,[Ql]->[Qm] are the transitions
   * - [Qa ... Qz] are the accepting states   
   * An example of automaton :  
   * Q1
   * Q2
   * a, [Q1] -> [Q2]
   * Q2
   * @returns 
   */
  static strToAutomaton(content: String) {
    const sContent = content.split("\n");
    const IN_INITIAL = 0, IN_TRANSITION = 1, IN_ACCEPTING = 2;
    let statePhase = IN_INITIAL;
    const initalState: string[] = [],
      acceptingStates: string[] = [],
      transitions: {
        current: string, symbol: string, next: string
      }[] = [],
      statesName: Set<string> = new Set(), alphabetSet: Set<string> = new Set();
    for (const line of sContent) {
      if (!line.includes("-") && line.length !== 0) {
        let stateName = line.substring(line.indexOf('[') + 1, line.indexOf(']'));
        statesName.add(stateName)
        if (statePhase === IN_INITIAL) {
          initalState.push(stateName.trim());
        } else {
          statePhase = IN_ACCEPTING;
          acceptingStates.push(stateName.trim())
        }
      } else if (line.match(/[a-zA-Z0-9]+/)) {
        statePhase = IN_TRANSITION;
        let split = line.match(/[A-Za-z0-9]+/g)!;
        let current = split[1];
        let symbol = split[0];
        let next = split[2];
        transitions.push({
          current: current,
          next: next,
          symbol: symbol
        })
        statesName.add(current);
        statesName.add(next);
        alphabetSet.add(symbol);
      }
    }
    let alphabet = new AlphabetDFA(...alphabetSet);
    let stateMap: Map<string, StateDFA> = new Map();
    let stateSet: Set<StateDFA> = new Set();
    statesName.forEach(e => {
      let state = new StateDFA(e, acceptingStates.includes(e), initalState.includes(e), alphabet)
      stateMap.set(e, state);
      stateSet.add(state)
    });
    transitions.forEach(({ current, symbol, next }) =>
      stateMap.get(current)!.addTransition(
        symbol,
        stateMap.get(next)!)
    )

    return new DFA_NFA(stateSet);
  }

  static regexToAutomaton(regex: string) {
    return regexToAutomaton(regex)
  }

  allStates() {
    return [...this.states.values()]
  }

  toString() {
    let txt: String[] = [];
    this.initialStates.forEach(e => txt.push('[' + e.name + "]"));
    this.allStates().forEach(state =>
      state.getAllOutTransitions().forEach((nextStates, symbol) => nextStates.forEach(next => txt.push(`${symbol},[${state.name}]->[${next.name}]`))));
    this.acceptingStates().forEach(e => txt.push("[" + e.name + "]"));
    return txt.join('\n');
  }

  findWordAccepted(minLength = 0) {
    let aut = this.minimize()
    if (aut.isEmpty()) return undefined;

    let acceptedWords: string[] = []
    let toExplore = [...aut.initialStates].map(state => ({ state, word: "" }))

    if (aut.initialStates.some(e => e.isAccepting))
      acceptedWords.push("")

    if (minLength === 0 && acceptedWords.length)
      return ""

    while (toExplore.length) {
      let newToExplore = []
      for (const { state, word } of toExplore) {
        for (const symbol of aut.alphabet.symbols) {
          let successors = state.getSuccessor(symbol)
          if (successors) {
            for (const state of successors) {
              if (!state.isAccepting &&
                state.getAllSuccessors().size === 1 &&
                state.getAllSuccessors().has(state))
                continue
              let newWord = word + symbol
              if (state.isAccepting) {
                acceptedWords.push(newWord)
                if (newWord.length >= minLength) return newWord
              }
              newToExplore.push({ state, word: newWord });
            }
          }
        }
      }
      if (newToExplore.length === 0) break
      toExplore = shuffle(newToExplore);
    }
    return toExplore.reduce((old, n) => n.word.length > old.length ? n.word : old, acceptedWords[acceptedWords.length - 1])
  }
}