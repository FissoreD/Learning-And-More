import DFA_NFA from "../DFA_NFA";
// import noam from "./noam";
import StateDFA from "../StateDFA";
interface HisTransition {
  fromState: number | number[],
  toStates: number[] | number[][],
  symbol: string
}

interface HisAutomaton {
  alphabet: string[],
  initialState?: number | number[],
  states: number[],
  transitions: HisTransition[],
  acceptingStates: number[] | number[][]
}

function HisAutomaton2Mine(aut: HisAutomaton): DFA_NFA {

  let states: StateDFA[] = aut.states.map(
    e => new StateDFA(
      e + "",
      aut.acceptingStates.some(x => x + "" === e + ""),
      (typeof aut.initialState === "number" ? aut.initialState + "" === e + "" : aut.initialState?.some(x => x + "" === e + "")) || false,
      aut.alphabet))

  let statesMap: Map<string, StateDFA> = new Map(),
    statesSet: Set<StateDFA> = new Set();
  for (const state of states) {
    statesMap.set(state.name, state)
    statesSet.add(state)
  }

  for (const transition of aut.transitions) {
    let from = transition.fromState
    let symbol = transition.symbol
    let to = transition.toStates
    to.forEach(state =>
      statesMap.get(from + "")?.addTransition(symbol, statesMap.get(state + "")!))
  }

  return new DFA_NFA(statesSet);
}

// export function MyAutomatonToHis(aut: DFA_NFA): HisAutomaton {
//   let stateList = Array.from(aut.states).map(e => e[1]);
//   let state2int = (state: State) => stateList.indexOf(state);
//   let states = stateList.map(e => state2int(e))
//   let startState = states.length;
//   let transitions: HisTransition[] = stateList.map(state => Array.from(state.getAllOutTransitions()).map(transition =>
//   ({
//     fromState: state2int(state),
//     symbol: transition[0],
//     toStates: transition[1].map(e => state2int(e))
//   })).flat()).flat();
//   if (aut.initialStates.length > 1) {
//     transitions.push(({
//       fromState: startState,
//       symbol: "$",
//       toStates: aut.initialStates.map(e => state2int(e))
//     }));
//     states.push(startState)
//   } else startState = state2int(aut.initialStates[0])
//   let res: HisAutomaton = {
//     acceptingStates: aut.acceptingStates().map(e => state2int(e)),
//     alphabet: Array.from(aut.alphabet),
//     states: states,
//     initialState: startState,
//     transitions: transitions
//   }
//   return res;
// }

/** Return the mDFA for a regex */
export default function regexToAutomaton(regex: string): DFA_NFA {
  const noam = require("./noam");
  let res = noam.re.string.toAutomaton(regex);
  return minimizeAutomaton(res);
}

function minimizeAutomaton(automatonInput: HisAutomaton): DFA_NFA {
  const noam = require("./noam");
  let automaton = automatonInput
  automaton = noam.fsm.convertEnfaToNfa(automaton);
  automaton = noam.fsm.convertNfaToDfa(automaton);
  let statesToNumbers = (noam.fsm.convertStatesToNumbers(automaton))
  let aa = HisAutomaton2Mine(statesToNumbers)
  let minimized = aa.minimize()
  return minimized
}


// import { todo } from "../tools";
// import Automaton from "./fsm/DFA_NFA";

// class OR { a: REGEX; b: REGEX; constructor(a: REGEX, b: REGEX) { this.a = a; this.b = b } }
// class CAT { a: REGEX; b: REGEX; constructor(a: REGEX, b: REGEX) { this.a = a; this.b = b } }
// class PAR { a: REGEX; constructor(a: REGEX) { this.a = a; } }
// class KLN { a: REGEX; constructor(a: REGEX) { this.a = a } }
// class NOT { a: REGEX; constructor(a: REGEX) { this.a = a } }
// class TKN { a: string; constructor(a: string) { this.a = a } }
// class EPS { };
// class EMPTY { };

// type REGEX = OR | CAT | PAR | KLN | TKN | EPS | EMPTY | NOT

// export default class RegexParser {

//   private constructor() { }

//   /**
//    * Takes a regex in input and returns the corresponding DFA
//    * Regex Grammar:
//    * G ::= G + G
//    *     | G*
//    *     | ( G )
//    *     | T
//    * T ::= $ | [0-9a-zA-Z]
//    */
//   static regex_to_DFA(regex: string): Automaton {
//     return todo()
//   }

//   static string_to_regex(regex: string, start?: number, end?: number): REGEX {
//     if (start === undefined) {
//       // Remove spaces
//       regex = start ? regex : regex.replace(" ", "");
//       // Setting start and end for the first time
//       start = 0;
//       end = regex.length
//       // Remove multiple side by side Klenee stars
//       regex = regex.replace(/\*+/g, "*")
//     }
//     let fst_regex: REGEX;
//     let fst_char = regex[start]
//     if (fst_char === "(") {
//       let pos = start + 1;
//       let cnt = 0;
//       while (pos < end!) {
//         if (cnt < 0) break
//         if (regex[pos] === "(") cnt++
//         else if (regex[pos] === ")") cnt--
//         pos++
//       }
//       fst_regex = new PAR(this.string_to_regex(regex, start + 1, pos - 1))
//       start = pos
//     } else if (fst_char.match(/^[A-Za-z0-9]$/g)) {
//       fst_regex = new TKN(fst_char)
//       start++;
//     } else if (fst_char === "~") {
//       return new NOT(RegexParser.string_to_regex(regex, start + 1, end))
//     } else {
//       throw new Error("Invalid regex to Parse")
//     }
//     let snd_char = regex[start]
//     if (snd_char === "*") {
//       fst_regex = new KLN(fst_regex)
//       start++
//       snd_char = regex[start]
//     }
//     if (start === end) return fst_regex;
//     if (snd_char === "(") {
//       return new CAT(fst_regex, RegexParser.string_to_regex(regex, start, end))
//     } else if (snd_char.match(/^[A-Za-z0-9]$/g)) {
//       if (start + 1 === end) return new CAT(fst_regex, new TKN(snd_char))
//       return new CAT(fst_regex, RegexParser.string_to_regex(regex, start + 1, end))
//     } else if (snd_char === "+") {
//       if (start + 1 === end) return fst_regex
//       return new OR(fst_regex, RegexParser.string_to_regex(regex, start + 1, end))
//     } else if (snd_char === "~") {
//       return new CAT(fst_regex, new NOT(RegexParser.string_to_regex(regex, start + 1, end)))
//     }
//     throw new Error("Invalid regex")
//   }

//   static same_regex(r1: REGEX, r2: REGEX, first = true): boolean {
//     if (r1 instanceof TKN && r2 instanceof TKN) {
//       return r1.a === r2.a;
//     } else if ((r1 instanceof CAT && r2 instanceof CAT) || (r1 instanceof OR && r2 instanceof OR)) {
//       return RegexParser.same_regex(r1.a, r2.a) && RegexParser.same_regex(r1.b, r2.b)
//     } else if ((r1 instanceof PAR && r2 instanceof PAR) || (r1 instanceof KLN && r2 instanceof KLN)) {
//       return RegexParser.same_regex(r1.a, r2.a)
//     }
//     return false;
//   }

//   static regex_minus_letter(r1: REGEX, pref: string): REGEX {
//     switch (r1.constructor) {
//       case EMPTY: case EPS:
//         return false
//       case TKN:
//         return (<TKN>r1).a === pref ? new EPS() : new EMPTY()
//       case KLN:
//         return new CAT(this.regex_minus_letter((<KLN>r1).a, pref), r1)
//       case OR:
//         return new OR(this.regex_minus_letter((<OR>r1).a, pref), this.regex_minus_letter((<OR>r1).b, pref))
//       case CAT:
//         let a_minus_pref = new CAT(RegexParser.regex_minus_letter((<CAT>r1).a, pref), (<CAT>r1).b)
//         if (r1)
//           return new OR(a_minus_pref, RegexParser.regex_minus_letter((<CAT>r1).b, pref))
//         return a_minus_pref
//       case NOT:
//         return new NOT(RegexParser.regex_minus_letter((<NOT>r1).a, pref))
//       case PAR:
//         return new PAR(this.regex_minus_letter((<PAR>r1).a, pref))
//       default: throw new Error("Should not be here")
//     }
//   }

//   static has_epsilon(r1: REGEX): boolean {
//     switch (r1.constructor) {
//       case TKN: case EMPTY:
//         return false
//       case KLN: case EPS:
//         return true
//       case OR:
//         return this.has_epsilon((<OR>r1).a) || this.has_epsilon((<OR>r1).b)
//       case CAT:
//         return this.has_epsilon((<CAT>r1).a) && this.has_epsilon(((<CAT>r1).b))
//       case PAR:
//         return this.has_epsilon((<PAR>r1).a)
//       default: throw new Error("Should not be here")
//     }
//   }

//   static has_empty(r1: REGEX): boolean {
//     switch (r1.constructor) {
//       case EMPTY:
//         return true
//       case KLN: case EPS: case TKN:
//         return true
//       case OR:
//         return this.has_empty((<OR>r1).a) || this.has_empty((<OR>r1).b)
//       case CAT:
//         return this.has_empty((<CAT>r1).a) && this.has_empty(((<CAT>r1).b))
//       case PAR:
//         return this.has_empty((<PAR>r1).a)
//       case NOT:
//         return this.has_empty((<NOT>r1).a)
//       default: throw new Error("Should not be here")
//     }
//   }

//   static simplyfy_regex(r1: REGEX): REGEX {
//     switch (r1.constructor) {
//       case TKN: case EMPTY: case EPS:
//         return r1
//       case KLN: {
//         let current = <KLN>r1
//         let current_a = RegexParser.simplyfy_regex(current.a)
//         if (current_a instanceof EMPTY || current_a instanceof EPS) return current_a
//         return new KLN(current_a)
//       }
//       case OR: {
//         let current = <OR>r1
//         let current_a = RegexParser.simplyfy_regex(current.a)
//         let current_b = RegexParser.simplyfy_regex(current.b)
//         if (current_a instanceof EMPTY) return current_b
//         if (current_b instanceof EMPTY) return current_a
//         return new OR(current_a, current_b);
//       }
//       case CAT: {
//         let current = <CAT>r1
//         let current_a = RegexParser.simplyfy_regex(current.a)
//         let current_b = RegexParser.simplyfy_regex(current.b)
//         if (current_a instanceof EMPTY || current_b instanceof EMPTY)
//           return new EMPTY()
//         if (current_a instanceof EPS) return current_b
//         if (current_a instanceof EPS) return current_a
//         return new CAT(current_a, current_b);
//       }
//       case PAR: {
//         let current = <PAR>r1
//         let current_a = RegexParser.simplyfy_regex(current.a)
//         if (current_a instanceof TKN || current_a instanceof EMPTY || current_a instanceof EPS)
//           return current_a
//         return new PAR(current_a)
//       }
//       case NOT: {
//         let current = <NOT>r1
//         let current_a = RegexParser.simplyfy_regex(current.a)
//         if (current_a instanceof EMPTY)
//           return current_a
//         return new NOT(current_a)
//       }
//       default: throw new Error("Should not be here" + r1.constructor)
//     }
//   }
// }