import { todo, to_eps } from "../../tools";
import { FSM } from "./FSM_interface";
import { AlphabetVPA, StateVPA } from "./state_vpa";

export type ALPHABET_TYPE = "INT" | "RET" | "CALL"
export const ALPH_TYPE_LIST: ALPHABET_TYPE[] = ["INT", "RET", "CALL"]

export class VPA implements FSM<AlphabetVPA, StateVPA> {
  states: Map<string, StateVPA>;
  initialStates: StateVPA[];
  alphabet: AlphabetVPA;
  stack: string[];
  stack_alphabet: string[];

  /** @todo: stack alphabet can be undefined and therefore self-created */
  constructor(stateList: Set<StateVPA> | StateVPA[]) {
    stateList = new Set(stateList);
    this.states = new Map();
    stateList.forEach(e => this.states.set(e.name, e));
    this.stack = []
    this.stack_alphabet = [...stateList][0].stack_alphabet

    this.initialStates = this.all_states().filter(s => s.isInitial);
    this.alphabet = {
      CALL: [...new Set([...stateList].map(e => e.alphabet.CALL).flat())],
      RET: [...new Set([...stateList].map(e => e.alphabet.RET).flat())],
      INT: [...new Set([...stateList].map(e => e.alphabet.INT).flat())]
    };
  }

  give_state(word: string): StateVPA | undefined {
    return todo()
  }

  complete(p?: { bottom?: StateVPA, alphabet?: AlphabetVPA, stack_alp?: string[] }): VPA {
    let alphabet = p?.alphabet || this.alphabet
    let stack_alph = p?.stack_alp || this.stack_alphabet
    let bottom = p?.bottom || StateVPA.Bottom(alphabet, stack_alph)
    let to_add = false;

    for (const alph_type of ALPH_TYPE_LIST) {
      for (const symbol of alphabet[alph_type]) {
        for (let pos = 0; pos < (alph_type === "INT" ? 1 : stack_alph.length); pos++) {
          let top_stack = alph_type === "INT" ? "" : stack_alph[pos]
          bottom.add_transition({ type: alph_type, symbol, top_stack: top_stack, successor: bottom });
          for (const state of this.states.values()) {
            if (alph_type !== "INT") this.stack.push(stack_alph[pos])
            let transintion = this.findTransition(state, symbol)
            if (transintion === undefined || transintion.length === 0) {
              state.add_transition({ type: alph_type, symbol, top_stack, successor: bottom });
              to_add = true;
            }
          }
        }
      }
    }
    if (to_add) {
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

  symmetric_difference(aut: VPA): VPA {
    return this.difference(aut).union(aut.difference(this));
  }

  clone(): VPA {
    throw todo();
  }

  complement(): VPA {
    throw todo();
  }

  state_number(): number {
    throw this.states.size
  }

  transition_number(): number {
    throw [...this.states.values()].reduce((a, b) => a + b.get_out_transition_number(), 0)
  }

  is_deterministic(): boolean {
    throw todo();
  }

  same_language(aut: VPA): boolean {
    throw todo();
  }

  accept_word(word: string): boolean {
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
          let next_transition = this.findTransition(state, symbol)
          if (next_transition)
            for (const nextState of next_transition) {
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

  is_empty(): boolean {
    return false;
  }

  is_full(): boolean {
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
    return state!.getSuccessor({ symbol, top_stack: (this.alphabet.RET.includes(symbol) ? this.stack.pop() : undefined), stack: this.stack })!
  }

  accepting_states(): StateVPA[] {
    throw [...this.states.values()].filter(e => e.isAccepting)
  }

  all_states(): StateVPA[] {
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
          for (let i = 0; i < (type === "INT" ? 1 : this.stack_alphabet.length); i++) {
            if (type !== "INT") this.stack.push(this.stack_alphabet[i])
            let next_states = this.findTransition(state, alph[j])
            if (next_states)
              for (const nextState of next_states) {
                let stateA_concat_stateB = name + '&' + nextState.name;
                let trans_descr;
                switch (type) {
                  case "INT": trans_descr = `${alph[j]}`; break;
                  case "CALL": trans_descr = `+(${alph[j]},${this.stack_alphabet[i]})`; break;
                  case "RET": trans_descr = `-(${alph[j]},${this.stack_alphabet[i]})`; break;
                }
                if (triples[stateA_concat_stateB]) {
                  triples[stateA_concat_stateB].push(trans_descr)
                } else {
                  triples[stateA_concat_stateB] = [trans_descr]
                }
              }
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

  toString(): String {
    throw todo();
  }
}
