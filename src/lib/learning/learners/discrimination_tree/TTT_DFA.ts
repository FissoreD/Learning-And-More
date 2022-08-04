import AlphabetDFA from "../../../automaton/regular/AlphabetDFA";
import DFA_NFA from "../../../automaton/regular/DFA_NFA";
import StateDFA from "../../../automaton/regular/StateDFA";
import { toEps } from "../../../tools";
import Teacher from "../../teachers/Teacher";
import DiscTreeDFA from "./DiscTreeDFA";
import TTT_Father from "./TTT_Father";

export default class TTT_DFA extends TTT_Father<string, StateDFA> {
  lastSplit: { u: string, a: string, v: string, uaState: string, uState: string } | undefined;
  alphabet: AlphabetDFA;

  constructor(teacher: Teacher<StateDFA>) {
    super(teacher, new DiscTreeDFA(""))
    this.alphabet = teacher.alphabet as AlphabetDFA
  }

  initiate() {
    let root = this.dataStructure.getRoot();
    let [addedRight, addedLeft] = [false, false]
    for (const symbol of ["", ...this.alphabet.symbols]) {
      if (addedRight && addedLeft) break
      let memberAnsower = this.teacher.member(symbol)
      if (memberAnsower && addedRight === false) {
        this.dataStructure.addRightChild({ parent: root, name: symbol });
        addedRight = true;
      } else if (!memberAnsower && addedLeft === false) {
        this.dataStructure.addLeftChild({ parent: root, name: symbol });
        addedLeft = true;
      }
    }
  }

  makeNextQuery() {
    if (this.finish) return
    let ce: string | undefined;
    let isTeacher: boolean;
    this.makeAutomaton()
    if (this.toStabilizeHypothesis()) {
      ce = this.lastCe!.value;
      isTeacher = false;
    } else {
      ce = this.teacher.equiv(this.automaton!)
      isTeacher = true
    }

    if (ce === undefined) { this.finish = true; return }
    let { a, v, uaState, uState, u } = this.split_ce_in_uav(ce)
    this.lastSplit = { u, a, v, uaState: uaState!, uState: uState! }

    this.lastCe = { value: uState + a + v, accepted: !this.automaton!.acceptWord(uState + a + v), isTeacher }
    if (isTeacher) return
    this.dataStructure.splitLeaf({
      leafName: uaState!,
      nameLeafToAdd: uState + a,
      newDiscriminator: v,
      isTop: !this.automaton!.acceptWord(uaState + v)
    })
  }

  makeAutomaton(): DFA_NFA {
    let initial_state = this.dataStructure.sift("", this.teacher)!
    let states = new Map([...this.dataStructure.getLeaves().values()].map(e => [e.name, new StateDFA(e.name, e.isAccepting!, e === initial_state, this.alphabet)]))

    let L = [...states.keys()]

    while (L.length > 0) {
      const state = L.pop()!
      for (const symbol of this.alphabet.symbols) {
        let newWord = state + symbol
        let res = this.dataStructure.sift(newWord, this.teacher)

        if (res === undefined) {
          res = this.dataStructure.addRoot(newWord)
          L.push(res.name)
          states.set(newWord, new StateDFA(newWord, res.isAccepting!, false, this.alphabet))
        }
        states.get(state)!.addTransition(symbol, states.get(res.name)!)
      }
    }
    return (this.automaton = new DFA_NFA([...states.values()]))
  }

  split_ce_in_uav(ce: string) {
    let u: string, a: string, v: string;
    for (let i = 0; i < ce.length; i++) {
      u = ce.substring(0, i);
      a = ce[i];
      v = ce.substring(i + 1);
      let uState = this.automaton!.giveState(u)?.name
      let uaState = this.automaton!.giveState(u + a)?.name
      if (this.teacher.member(uState + a + v) !== this.teacher.member(uaState + v)) {
        return { u, a, v, uaState, uState }
      }
    }
    throw new Error("Invalid counter-example")
  }

  splitToString() {
    let [u, a, v, uState, uaState] = [toEps(this.lastSplit!.u), this.lastSplit!.a, toEps(this.lastSplit!.v), toEps(this.lastSplit!.uState), toEps(this.lastSplit!.uaState)]
    return `The conunter-example could be split into ${u + "." + a + "." + v} because (${"⌊" + u + "⌋." + a + "." + v} = ${uState + "." + a + "." + v}) ≠ (${"⌊" + u + "." + a + "⌋." + v} = ${uaState + "." + v})`;
  }
}