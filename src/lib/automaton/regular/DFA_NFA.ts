import { sameVector, toEps } from "../../tools";
import FSM from "../FSM_interface";
import regexToAutomaton from "./RegexParser";
import State from "./StateDFA";

export default class DFA_NFA implements FSM<string[], State> {
  states: Map<string, State>;
  initialStates: State[];
  alphabet: string[];

  constructor(stateList: Set<State> | State[]) {
    stateList = new Set(stateList);
    this.states = new Map();
    stateList.forEach(e => this.states.set(e.name, e));

    this.initialStates = this.allStates().filter(s => s.isInitial);
    this.alphabet = [...new Set([...stateList].map(e => e.alphabet).flat())];
  }

  complete(p?: { bottom?: State, alphabet?: string[] }) {
    let alphabet = p?.alphabet || this.alphabet
    let bottom = p?.bottom || State.Bottom(alphabet)
    let toAdd = false;
    for (const symbol of alphabet) {
      bottom.addTransition(symbol, bottom);
      for (const state of this.states.values()) {
        let transintion = this.findTransition(state, symbol)
        if (transintion === undefined || transintion.length === 0) {
          state.addTransition(symbol, bottom);
          toAdd = true;
        }
      }
    }
    if (toAdd) {
      this.states.set(bottom.name, bottom)
    }
    return this
  }

  readWord(word: string): [State | undefined, boolean] {
    if (word.length === 0)
      return [this.initialStates.find(e => e.isAccepting) || this.initialStates[0], this.initialStates.some(e => e.isAccepting)];
    let nextStates: Set<State> = new Set(this.initialStates);
    for (let index = 0; index < word.length && nextStates.size > 0; index++) {
      let nextStates2: Set<State> = new Set();
      const symbol = word[index];
      if (!this.alphabet.includes(symbol)) {
        return [undefined, false]
      }
      for (const state of nextStates) {
        let nextTransition = this.findTransition(state, symbol)
        if (nextTransition)
          for (const nextState of nextTransition) {
            nextStates2.add(nextState)
            if (index === word.length - 1 && nextState.isAccepting)
              return [nextState, true]
          }
        // Array.from(this.findTransition(state, symbol)).forEach(e => nextStates2.add(e))
      }
      nextStates = nextStates2;
    }
    return [nextStates.values().next().value, false];
  }

  giveState(word: string): State | undefined {
    return this.readWord(word)[0]
  }

  acceptWord(word: string): boolean {
    return this.readWord(word)[1]
  }

  findTransition(state: State, symbol: string) {
    return state!.getSuccessor(symbol)!
  }

  /* istanbul ignore next */
  toDot() {
    let txt = "digraph {rankdir = LR\nfixedsize=true\n"
    let triples: { [id: string]: string[] } = {}
    for (const [name, state] of this.states) {
      for (let j = 0; j < this.alphabet.length; j++) {
        for (const nextState of this.findTransition(state, this.alphabet[j])) {
          let stateA_concat_stateB = name + '&' + nextState.name;
          if (triples[stateA_concat_stateB]) {
            triples[stateA_concat_stateB].push(this.alphabet[j])
          } else {
            triples[stateA_concat_stateB] = [this.alphabet[j]]
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
    return this.allStates().every(e => this.alphabet.every(l => e.getSuccessor(l) === undefined || e.getSuccessor(l).length === 1)) && this.initialStates.length <= 1
  }

  /** 
   * @returns a fresh Determinized Automaton 
   */
  determinize(): DFA_NFA {
    this.complete()
    let allStates = this.allStates()
    let newStates = new Map<string, State>();
    let stateMap = new Map(allStates.map((e, pos) => [e.name, pos]))

    let initState = [...this.initialStates].sort((a, b) => stateMap.get(a.name)! - stateMap.get(b.name)!);
    let toTreat = [initState.map(e => stateMap.get(e.name)!)];

    let findState = (n: number[]) => newStates.get(JSON.stringify(n))!;
    let addState = (name: number[], isInitial = false) =>
      newStates.set(JSON.stringify(name),
        new State(JSON.stringify(name),
          name.some(e => allStates[e].isAccepting),
          isInitial, this.alphabet));
    let addSuccessor = (current: number[], letter: string, successor: number[]) =>
      findState(current).addTransition(letter, findState(successor));

    addState(toTreat[0], true);

    let done: number[][] = []
    while (toTreat.length > 0) {
      let current = toTreat.shift()!;
      done.push(current)
      for (const letter of this.alphabet) {
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
    let res = new DFA_NFA([...newStates.values()])
    return res
  }

  minimize(): DFA_NFA {
    this.complete()

    let aut = this.isDeterministic() ? this : this.determinize()

    /** List of states reachable from *the* initial state */
    let stateList = new Set<string>();
    stateList.add(aut.initialStates[0].name)

    // BFS to remove not reachable node from initial state
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

    let P: Set<string>[] = [new Set(), new Set()];  // P := {F, Q \ F} 
    stateList.forEach(s => {
      (aut.states.get(s)!.isAccepting ? P[0] : P[1]).add(s)
    })
    P = P.filter(p => p.size > 0)

    let pLength = () => P.reduce((a, p) => a + p.size, 0)

    let W: Set<string>[] = Array.from(P)
    while (W.length > 0) {
      let A = W.shift()!
      for (const letter of aut.alphabet) {
        // X = the set of states for which a transition on letter leads to a state in A
        let X: Set<string> = new Set()
        A.forEach(e => { aut.states.get(e)!.getPredecessor(letter)?.forEach(s => X.add(s.name)) })

        // let {S1 = X ∩ Y; S2 = Y \ X} fotall Y in P
        let P1 = P.map(Y => {
          let [X_inter_Y, Y_minus_X] = [new Set<string>(), new Set<string>()];
          Y.forEach(state => X.has(state) ? X_inter_Y.add(state) : Y_minus_X.add(state))
          return { Y, X_inter_Y, Y_minus_X }
        }).filter(({ X_inter_Y, Y_minus_X }) => X_inter_Y.size > 0 && Y_minus_X.size > 0);

        for (const { Y, X_inter_Y, Y_minus_X } of P1) {
          // replace Y in P by the two sets X ∩ Y and Y \ X
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

    let oldStateToNewState: Map<string, State> = new Map();

    let newStates = new Set([...P].filter(partition => partition.size > 0).map((partition, pos) => {
      let representant: State[] = [...partition].map(e => aut.states.get(e)!);
      let newState = new State(pos + "",
        representant.some(e => e.isAccepting),
        representant.some(e => e.isInitial),
        representant[0].alphabet
      )
      partition.forEach(state => oldStateToNewState.set(state, newState))
      return newState;
    }));

    for (const partition of P) {
      for (const oldState of partition) {
        for (const letter of aut.alphabet) {
          for (const successor of aut.states.get(oldState)!.getSuccessor(letter)) {
            if (!oldStateToNewState.get(oldState)!.getSuccessor(letter)![0] ||
              (oldStateToNewState.get(oldState)!.getSuccessor(letter)![0].name !== oldStateToNewState.get(successor.name)!.name))
              oldStateToNewState.get(oldState)!.addTransition(letter, oldStateToNewState.get(successor.name)!)
          }
        }
      }
    }

    return new DFA_NFA(newStates)
  }

  clone(alphabet?: string[]) {
    let all_states = this.allStates()
    let res = new DFA_NFA(all_states.map(e => e.clone({ alphabet })));
    this.alphabet.forEach(l =>
      all_states.forEach((e, pos) =>
        e.getSuccessor(l).forEach(succ => res.allStates()[pos].addTransition(l, res.allStates()[all_states.indexOf(succ)]))
      ))
    return res;
  }

  union(aut: DFA_NFA): DFA_NFA {
    let res;
    let states = [
      ...aut.allStates().map(e => e.clone({ name: "1" + e.name })),
      ...this.allStates().map(e => e.clone({ name: "2" + e.name }))
    ];
    let alphabet = [...new Set(states.map(e => e.alphabet).flat())];
    states.forEach(e => e.alphabet = alphabet)
    res = new DFA_NFA(states);
    res.complete()

    alphabet.forEach(l => {
      aut.allStates().forEach((e, pos) => e.getSuccessor(l)?.forEach(succ =>
        states[pos].addTransition(l, states[aut.allStates().indexOf(succ)])
      ))
      this.allStates().forEach((e, pos) => e.getSuccessor(l)?.forEach(succ =>
        states[pos + aut.allStates().length].addTransition(l, states[this.allStates().indexOf(succ) + aut.allStates().length])
      ))
    });
    if (this.isDeterministic() && aut.isDeterministic()) {
      return res.determinize()
    }
    return res;
  }

  intersection(aut: DFA_NFA): DFA_NFA {
    return aut.complement([...this.alphabet, ...aut.alphabet]).union(this.complement([...this.alphabet, ...aut.alphabet])).complement([...this.alphabet, ...aut.alphabet])
  }

  difference(aut: DFA_NFA): DFA_NFA {
    return aut.union(this.complement([...aut.alphabet, ...this.alphabet])).complement()
  }

  symmetricDifference(aut: DFA_NFA): DFA_NFA {
    return this.difference(aut).union(aut.difference(this));
  }

  isEmpty() {
    let aut = this.isDeterministic() ? this : this.determinize()
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

  /** 
   * @returns a fresh deterministic complemented automaton */
  complement(alphabet?: string[] | string) {
    let res = this.clone();
    res.alphabet = alphabet ? [...alphabet] : res.alphabet
    res.complete()
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
    let alphabet = Array.from(alphabetSet);
    let stateMap: Map<string, State> = new Map();
    let stateSet: Set<State> = new Set();
    statesName.forEach(e => {
      let state = new State(e, acceptingStates.includes(e), initalState.includes(e), alphabet)
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

  static regex2automaton(regex: string) {
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
}