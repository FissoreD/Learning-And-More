import { todo, toEps } from "../../tools";
import { FSM } from "./FSM_interface";
import { AlphabetVPA, StateVPA } from "./state_vpa";

export type ALPHABET_TYPE = "INT" | "RET" | "CALL"
export const ALPH_TYPE_LIST: ALPHABET_TYPE[] = ["INT", "RET", "CALL"]

export class VPA implements FSM<AlphabetVPA, StateVPA> {
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
    return todo()
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
    throw todo();
  }

  intersection(aut: VPA): VPA {
    return aut.complement().union(this.complement()).complement()
  }

  difference(aut: VPA): VPA {
    return aut.union(this.complement()).complement()
  }

  symmetricDifference(aut: VPA): VPA {
    return this.difference(aut).union(aut.difference(this));
  }

  clone(): VPA {
    throw todo();
  }

  complement(): VPA {
    throw todo();
  }

  getStateNumber(): number {
    throw this.states.size
  }

  getTransitionNumber(): number {
    throw [...this.states.values()].reduce((a, b) => a + b.getOutTransitionNumber(), 0)
  }

  isDeterministic(): boolean {
    throw todo();
  }

  sameLanguage(aut: VPA): boolean {
    throw todo();
  }

  acceptWord(word: string): boolean {
    if (word.length === 0)
      return this.initialStates.some(e => e.isAccepting);
    let nextStates: Set<StateVPA> = new Set(this.initialStates);
    for (let index = 0; index < word.length && nextStates.size > 0; index++) {
      console.log(this.stack);
      let nextStates2: Set<StateVPA> = new Set();
      const symbol = word[index];
      if (!this.alphabet.CALL.includes(symbol) &&
        !this.alphabet.INT.includes(symbol) &&
        !this.alphabet.RET.includes(symbol)) {
        return false
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
                return res
              }
            }
        } catch (e) {
          return false
        }
      }
      nextStates = nextStates2;
    }
    this.cleanStack()
    return false;
  }

  cleanStack() {
    this.stack = []
  }

  isEmpty(): boolean {
    return false;
  }

  isFull(): boolean {
    return false;
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
    throw [...this.states.values()].filter(e => e.isAccepting)
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
          for (let i = 0; i < (type === "INT" ? 1 : this.stackAlphabet.length); i++) {
            if (type !== "INT") this.stack.push(this.stackAlphabet[i])
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
      return `${toEps(A)} -> ${toEps(B)} [label = "${transition}"]`
    }).join("\n"));

    this.initialStates.forEach(s => {
      txt = txt.concat(`\nI${toEps(s.name)} [label="", style=invis, width=0]\nI${toEps(s.name)} -> ${toEps(s.name)}`);
    });

    // Accepting states
    allStates.forEach(s => {
      if (s.isAccepting)
        txt = txt.concat(`\n${toEps(s.name)} [peripheries=2]`)
    })

    txt += "\n}"
    return txt
  }

  toString(): String {
    throw todo();
  }
}
