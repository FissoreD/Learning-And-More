import { same_vector, todo } from "../../tools";
import { State } from "./state";

export class Automaton {
  states: Map<string, State>;
  initialStates: State[];
  all_states: State[];
  alphabet: string[];

  constructor(stateList: Set<State> | State[]) {
    stateList = new Set(stateList);
    this.all_states = Array.from(stateList);
    this.initialStates = this.all_states.filter(s => s.isInitial);
    this.alphabet = this.initialStates[0].alphabet;
    this.states = new Map();
    stateList.forEach(e => this.states.set(e.name, e));
  }

  complete() {
    let alphabet = this.alphabet
    let bottom = State.bottom(alphabet)
    let to_add = false;
    for (const symbol of alphabet) {
      bottom.add_transition(symbol, bottom);
      for (const state of this.all_states) {
        if (this.findTransition(state, symbol).length == 0) {
          state.add_transition(symbol, bottom);
          to_add = true;
        }
      }
    }
    if (to_add) {
      this.states.set(bottom.name, bottom)
      this.all_states.push(bottom)
    }
    return this
  }

  accept_word(word: string): boolean {
    if (word.length == 0)
      return this.initialStates.some(e => e.isAccepting);
    let nextStates: Set<State> = new Set(this.initialStates);
    for (let index = 0; index < word.length && nextStates.size > 0; index++) {
      let nextStates2: Set<State> = new Set();
      const symbol = word[index];
      if (!this.alphabet.includes(symbol)) {
        return false
      }
      for (const state of nextStates) {
        let next_transition = this.findTransition(state, symbol)
        if (next_transition)
          for (const nextState of next_transition) {
            nextStates2.add(nextState)
            if (index == word.length - 1 && nextState.isAccepting)
              return true
          }
        // Array.from(this.findTransition(state, symbol)).forEach(e => nextStates2.add(e))
      }
      nextStates = nextStates2;
    }
    return false;
  }

  findTransition(state: State, symbol: string) {
    return state!.outTransitions.get(symbol)!
  }

  /* istanbul ignore next */
  automatonToDot() {
    let txt = "digraph {rankdir = LR\n"
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

    let shape = this.all_states[0].name.length > 0 ? "circle" : "box"

    txt = txt.concat(`node [style=rounded, shape=${shape}]\n`);

    txt = txt.concat(Object.keys(triples).map(x => {
      let [states, transition] = [x, triples[x].join(",")]
      let split = states.split("&");
      let A = split[0], B = split[1];
      return `${A} -> ${B} [label = "${transition}"]`
    }).join("\n"));

    this.initialStates.forEach(s => {
      txt = txt.concat(`\nI${s.name} [label="", style=invis, width=0]\nI${s.name} -> ${s.name}`);
    });

    this.accepting_states().forEach(s => {
      txt = txt.concat(`\n${s.name} [peripheries=2]`)
    })

    txt += "\n}"
    return txt
  }

  accepting_states() {
    return this.all_states.filter(s => s.isAccepting);
  }

  state_number() {
    return this.states.size;
  }

  transition_number() {
    return Array.from(this.states).map(e => Array.from(e[1].outTransitions)).flat().reduce((a, b) => a + b[1].length, 0)
  }

  is_deterministic(): boolean {
    return this.all_states.every(e => this.alphabet.every(l => e.getSuccessor(l).length == 1))
  }

  /** @returns a fresh Determinized Automaton */
  determinize(): Automaton {
    this.complete()
    let new_states = new Map<string, State>();
    let state_map = new Map(this.all_states.map((e, pos) => [e, pos]))
    let init_state = [...this.initialStates].sort((a, b) => state_map.get(a)! - state_map.get(b)!);
    let to_treat = [init_state.map(e => state_map.get(e)!)];

    let find_state = (n: number[]) => new_states.get(JSON.stringify(n))!;
    let add_state = (name: number[], is_initial = false) =>
      new_states.set(JSON.stringify(name),
        new State(JSON.stringify(name),
          name.some(e => this.all_states[e].isAccepting),
          is_initial, this.alphabet));
    let add_successor = (current: number[], letter: string, successor: number[]) =>
      find_state(current).add_transition(letter, find_state(successor));

    add_state(to_treat[0], true);

    let done: number[][] = []
    while (to_treat.length > 0) {
      let current = to_treat.shift()!;
      done.push(current)
      for (const letter of this.alphabet) {
        let successor = [...new Set(current.map(e => this.all_states[e].getSuccessor(letter)).flat())].map(e => state_map.get(e)!).sort();
        // console.log({
        //   current: JSON.stringify(current.map(e => this.all_states[e].name)),
        //   next: JSON.stringify(current.
        //     map(e => this.all_states[e].
        //       getSuccessor(letter).flat().map(e => e.name))),
        //   letter
        // });
        if (done.some(e => same_vector(e, successor))) {
          add_successor(current, letter, successor);
        } else {
          add_state(successor)
          add_successor(current, letter, successor);
          to_treat.push(successor);
        }
      }
    }
    return new Automaton([...new_states.values()])
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
    let stateList: State[] = [aut.initialStates[0]];

    // BFS to remove not reachable node from initial state
    let toExplore = [aut.initialStates[0]]
    while (toExplore.length > 0) {
      let newState = toExplore.shift()!

      for (const successor of newState.successors) {
        if (!stateList.includes(successor)) {
          toExplore.push(successor)
          stateList.push(successor)
        }
      }
    }


    let P: Set<State>[] = [new Set(), new Set()];  // P := {F, Q \ F} 
    stateList.forEach(s => (s.isAccepting ? P[0] : P[1]).add(s))
    P = P.filter(p => p.size > 0)

    let pLength = () => P.reduce((a, p) => a + p.size, 0)

    let W: Set<State>[] = Array.from(P)
    while (W.length > 0) {
      let A = W.shift()!
      for (const letter of aut.alphabet) {
        // X = the set of states for which a transition on letter leads to a state in A
        let X: Set<State> = new Set()
        A.forEach(e => { e.inTransitions.get(letter)?.forEach(s => X.add(s)) })

        // let {S1 = X ∩ Y; S2 = Y \ X} fotall Y in P
        let P1 = P.map(Y => {
          let [X_inter_Y, Y_minus_X] = [new Set<State>(), new Set<State>()];
          Y.forEach(state => X.has(state) ? X_inter_Y.add(state) : Y_minus_X.add(state))
          return { Y, X_inter_Y, Y_minus_X }
        }).filter(({ X_inter_Y, Y_minus_X }) => X_inter_Y.size > 0 && Y_minus_X.size > 0);

        for (const { Y, X_inter_Y, Y_minus_X } of P1) {
          // replace Y in P by the two sets X ∩ Y and Y \ X
          P.splice(P.indexOf(Y), 1)
          P.push(X_inter_Y)
          P.push(Y_minus_X)
          if (pLength() != stateList.length) throw `Wanted ${stateList.length} had ${pLength()}`
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

    let oldStateToNewState: Map<State, State> = new Map();

    let newStates = new Set([...P].filter(partition => partition.size > 0).map((partition, pos) => {
      let representant = Array.from(partition);
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
          for (const successor of oldState.getSuccessor(letter)) {
            if (!oldStateToNewState.get(oldState)!.outTransitions.get(letter)![0] ||
              (oldStateToNewState.get(oldState)!.outTransitions.get(letter)![0].name != oldStateToNewState.get(successor)!.name))
              oldStateToNewState.get(oldState)!.add_transition(letter, oldStateToNewState.get(successor)!)
          }
        }
      }
    }

    return new Automaton(newStates)
  }

  clone() {
    let res = new Automaton(this.all_states.map(e => e.clone()));
    this.alphabet.forEach(l =>
      this.all_states.forEach((e, pos) =>
        e.getSuccessor(l).forEach(succ => res.all_states[pos].add_transition(l, res.all_states[this.all_states.indexOf(succ)]))
      ))
    return res;
  }

  /** 
   * if both automata are deterministic a DFA is returned
   * otherwise, a NFA is returned  
   * @returns the union of two Automata
   */
  union(aut: Automaton): Automaton {
    let res;
    let states = [...aut.all_states.map(e => e.clone()), ...this.all_states.map(e => e.clone())];
    let alphabet = [...new Set(states.map(e => e.alphabet).flat())];
    states.forEach(e => e.alphabet = alphabet)
    res = new Automaton(states);
    alphabet.forEach(l => {
      aut.all_states.forEach((e, pos) => e.getSuccessor(l)?.forEach(succ =>
        states[pos].add_transition(l, states[aut.all_states.indexOf(succ)])
      ))
      todo()
      this.all_states.forEach((e, pos) => e.getSuccessor(l)?.forEach(succ =>
        states[pos + aut.all_states.length].
          add_transition(l, states[this.all_states.indexOf(succ) + aut.all_states.length])
      ))
    });
    if (this.is_deterministic() && aut.is_deterministic()) {
      return res.determinize()
    }
    return res;
  }

  intersection(aut: Automaton): Automaton {
    return aut.complement().union(this.complement()).complement()
  }

  difference(aut: Automaton): Automaton {
    return this.intersection(aut.complement());
  }

  symmetric_difference(aut: Automaton): Automaton {
    return this.difference(aut).union(aut.difference(this));
  }

  is_empty() {
    let aut = this.is_deterministic() ? this : this.determinize()
    return aut.all_states.every(e => !e.isAccepting)
  }

  /** @returns if the automaton is the universal automaton */
  is_full() {
    let aut = this.is_deterministic() ? this : this.determinize()
    return aut.all_states.every(e => e.isAccepting)
  }

  same_language(aut: Automaton) {
    return this.difference(aut).is_empty()
  }

  complement() {
    this.complete();
    let res = this.determinize();
    res.all_states.forEach(e => {
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
    let sContent = content.split("\n");
    let IN_INITIAL = 0, IN_TRANSITION = 1, IN_ACCEPTING = 2;
    let statePhase = IN_INITIAL;
    const initalState: string[] = [], acceptingStates: string[] = [],
      transitions: { current: string, symbol: string, next: string }[] = [],
      statesName: Set<string> = new Set(), alphabetSet: Set<string> = new Set();
    for (const line of sContent) {
      if (!line.includes("-") && line.length != 0) {
        let stateName = line.substring(line.indexOf('[') + 1, line.indexOf(']'));
        statesName.add(stateName)
        if (statePhase == IN_INITIAL) {
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

  toString() {
    let txt: String[] = [];
    this.initialStates.forEach(e => txt.push('[' + e.name + "]"));
    this.all_states.forEach(state =>
      state.outTransitions.forEach((nextStates, symbol) => nextStates.forEach(next => txt.push(`${symbol},[${state.name}]->[${next.name}]`))));
    this.accepting_states().forEach(e => txt.push("[" + e.name + "]"));
    return txt.join('\n');
  }
}