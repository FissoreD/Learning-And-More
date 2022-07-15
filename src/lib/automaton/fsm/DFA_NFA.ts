import { same_vector, to_eps } from "../../tools";
import regexToAutomaton from "../regex_parser";
import { FSM } from "./FSM_interface";
import State from "./state";

export default class Automaton implements FSM<string[], State> {
  states: Map<string, State>;
  initialStates: State[];
  alphabet: string[];

  constructor(stateList: Set<State> | State[]) {
    stateList = new Set(stateList);
    this.states = new Map();
    stateList.forEach(e => this.states.set(e.name, e));

    this.initialStates = this.all_states().filter(s => s.isInitial);
    this.alphabet = [...new Set([...stateList].map(e => e.alphabet).flat())];
  }

  complete(p?: { bottom?: State, alphabet?: string[] }) {
    let alphabet = p?.alphabet || this.alphabet
    console.log("This alphabet", { alphabet });

    let bottom = p?.bottom || State.Bottom(alphabet)
    let to_add = false;
    for (const symbol of alphabet) {
      bottom.add_transition(symbol, bottom);
      for (const state of this.states.values()) {
        let transintion = this.findTransition(state, symbol)
        if (transintion === undefined || transintion.length === 0) {
          state.add_transition(symbol, bottom);
          to_add = true;
        }
      }
    }
    if (to_add) {
      this.states.set(bottom.name, bottom)
    }
    return this
  }

  read_word(word: string): [State | undefined, boolean] {
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
        let next_transition = this.findTransition(state, symbol)
        if (next_transition)
          for (const nextState of next_transition) {
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

  give_state(word: string): State | undefined {
    return this.read_word(word)[0]
  }

  accept_word(word: string): boolean {
    return this.read_word(word)[1]
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

    let all_states = this.all_states();

    let shape = "circle"

    txt = txt.concat(`node [style=rounded, shape=${shape}, fixedsize=true]\n`);

    txt = txt.concat(Object.keys(triples).map(x => {
      let [states, transition] = [x, triples[x].join(",")]
      let split = states.split("&");
      let A = split[0], B = split[1];
      return `${to_eps(A)} -> ${to_eps(B)} [label = "${transition}"]`
    }).join("\n"));

    this.initialStates.forEach(s => {
      txt = txt.concat(`\nI${to_eps(s.name)} [label="", style=invis, width=0]\nI${to_eps(s.name)} -> ${to_eps(s.name)}`);
    });

    // Accepting states
    all_states.forEach(s => {
      if (s.isAccepting)
        txt = txt.concat(`\n${to_eps(s.name)} [peripheries=2]`)
    })

    txt += "\n}"
    return txt
  }

  accepting_states() {
    return this.all_states().filter(s => s.isAccepting);
  }

  state_number() {
    return this.states.size;
  }

  transition_number() {
    return Array.from(this.states).map(([_, e]) => e.get_out_transition_number()).reduce((a, b) => a + b, 0)
  }

  is_deterministic(): boolean {
    return this.all_states().every(e => this.alphabet.every(l => e.getSuccessor(l) === undefined || e.getSuccessor(l).length === 1))
  }

  /** @returns a fresh Determinized Automaton */
  determinize(): Automaton {
    this.complete()
    let all_states = this.all_states()
    let new_states = new Map<string, State>();
    let state_map = new Map(all_states.map((e, pos) => [e.name, pos]))

    let init_state = [...this.initialStates].sort((a, b) => state_map.get(a.name)! - state_map.get(b.name)!);
    let to_treat = [init_state.map(e => state_map.get(e.name)!)];

    let find_state = (n: number[]) => new_states.get(JSON.stringify(n))!;
    let add_state = (name: number[], is_initial = false) =>
      new_states.set(JSON.stringify(name),
        new State(JSON.stringify(name),
          name.some(e => all_states[e].isAccepting),
          is_initial, this.alphabet));
    let add_successor = (current: number[], letter: string, successor: number[]) =>
      find_state(current).add_transition(letter, find_state(successor));

    add_state(to_treat[0], true);

    let done: number[][] = []
    while (to_treat.length > 0) {
      let current = to_treat.shift()!;
      done.push(current)
      for (const letter of this.alphabet) {
        let successor = [...new Set(current.map(e => all_states[e].getSuccessor(letter)).flat())].map(e => state_map.get(e.name)!).sort();

        if (new_states.has(JSON.stringify(successor))) {
          add_successor(current, letter, successor);
        } else {
          add_state(successor)
          add_successor(current, letter, successor);
        }
        if (!done.some(e => same_vector(e, successor))) {
          to_treat.push(successor)
        }
      }
    }
    let res = new Automaton([...new_states.values()])
    return res
  }

  /**
   * Hopcroft minimization Algorithm
   * If the automaton is not deterministic, it is determinized 
   * @returns A fresh determinized automaton 
   * @link https://en.wikipedia.org/wiki/DFA_minimization
   */
  minimize(): Automaton {
    this.complete()

    let aut = this.is_deterministic() ? this : this.determinize()

    /** List of states reachable from *the* initial state */
    let stateList = new Set<string>();
    stateList.add(aut.initialStates[0].name)

    // BFS to remove not reachable node from initial state
    let toExplore = [aut.initialStates[0]]
    while (toExplore.length > 0) {
      let newState = toExplore.shift()!

      for (const successor of newState.get_all_successors()) {
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
              oldStateToNewState.get(oldState)!.add_transition(letter, oldStateToNewState.get(successor.name)!)
          }
        }
      }
    }

    return new Automaton(newStates)
  }

  clone(alphabet?: string[]) {
    let all_states = this.all_states()
    let res = new Automaton(all_states.map(e => e.clone({ alphabet })));
    this.alphabet.forEach(l =>
      all_states.forEach((e, pos) =>
        e.getSuccessor(l).forEach(succ => res.all_states()[pos].add_transition(l, res.all_states()[all_states.indexOf(succ)]))
      ))
    return res;
  }

  /** 
   * If both automata are deterministic a DFA is returned
   * otherwise, a NFA is returned  
   * @returns a fresh Automaton of the union of two Automata
   */
  union(aut: Automaton): Automaton {
    let res;
    let states = [
      ...aut.all_states().map(e => e.clone({ name: "1" + e.name })),
      ...this.all_states().map(e => e.clone({ name: "2" + e.name }))
    ];
    let alphabet = [...new Set(states.map(e => e.alphabet).flat())];
    states.forEach(e => e.alphabet = alphabet)
    res = new Automaton(states);
    res.complete()

    alphabet.forEach(l => {
      aut.all_states().forEach((e, pos) => e.getSuccessor(l)?.forEach(succ =>
        states[pos].add_transition(l, states[aut.all_states().indexOf(succ)])
      ))
      this.all_states().forEach((e, pos) => e.getSuccessor(l)?.forEach(succ =>
        states[pos + aut.all_states().length].add_transition(l, states[this.all_states().indexOf(succ) + aut.all_states().length])
      ))
    });
    if (this.is_deterministic() && aut.is_deterministic()) {
      return res.determinize()
    }
    return res;
  }

  intersection(aut: Automaton): Automaton {
    return aut.complement([...this.alphabet, ...aut.alphabet]).union(this.complement([...this.alphabet, ...aut.alphabet])).complement([...this.alphabet, ...aut.alphabet])
  }

  difference(aut: Automaton): Automaton {
    return aut.union(this.complement([...aut.alphabet, ...this.alphabet])).complement()
  }

  symmetric_difference(aut: Automaton): Automaton {
    return this.difference(aut).union(aut.difference(this));
  }

  is_empty() {
    let aut = this.is_deterministic() ? this : this.determinize()
    return aut.all_states().every(e => !e.isAccepting)
  }

  /** @returns if the automaton is the universal automaton */
  is_full() {
    let aut = this.is_deterministic() ? this : this.determinize()
    return aut.all_states().every(e => e.isAccepting)
  }

  same_language(aut: Automaton) {
    return this.symmetric_difference(aut).is_empty()
  }

  /** @returns a fresh deterministic complemented automaton */
  complement(alphabet?: string[] | string) {
    let res = this.clone();
    res.alphabet = alphabet ? [...alphabet] : res.alphabet
    res.complete()
    if (!res.is_deterministic()) {
      res = this.determinize();
    }
    res.all_states().forEach(e => {
      e.isAccepting = !e.isAccepting
    });
    return res;
  }

  /**
   * Transform a String two an Automaton
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
      stateMap.get(current)!.add_transition(
        symbol,
        stateMap.get(next)!)
    )

    return new Automaton(stateSet);
  }

  static regex_to_automaton(regex: string) {
    return regexToAutomaton(regex)
  }

  all_states() {
    return [...this.states.values()]
  }

  toString() {
    let txt: String[] = [];
    this.initialStates.forEach(e => txt.push('[' + e.name + "]"));
    this.all_states().forEach(state =>
      state.get_all_out_transitions().forEach((nextStates, symbol) => nextStates.forEach(next => txt.push(`${symbol},[${state.name}]->[${next.name}]`))));
    this.accepting_states().forEach(e => txt.push("[" + e.name + "]"));
    return txt.join('\n');
  }
}