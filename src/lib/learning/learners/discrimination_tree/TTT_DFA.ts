import AlphabetDFA from "../../../automaton/regular/AlphabetDFA";
import DFA_NFA from "../../../automaton/regular/DFA_NFA";
import StateDFA from "../../../automaton/regular/StateDFA";
import Teacher from "../../teachers/Teacher";
import DiscTreeDFA from "./DiscTreeDFA";
import TTT_Father, { LastSplitType } from "./TTT_Father";

export default class TTT_DFA extends TTT_Father<string, StateDFA> {
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

  split_ce_in_uav(ce: string): LastSplitType<string> {
    let u: string, a: string, v: string;
    for (let i = 0; i < ce.length; i++) {
      u = ce.substring(0, i);
      a = ce[i];
      v = ce.substring(i + 1);
      let uState = this.automaton!.giveState(u)?.stateName
      let uaState = this.automaton!.giveState(u + a)?.stateName
      if (this.teacher.member(uState + a + v) !== this.teacher.member(uaState + v)) {
        return { u, a, v, uaState, uState, newLeaf: uState + a, newNodeLabel: v }
      }
    }
    throw new Error("Invalid counter-example")
  }

  updateCe(ce: string, isTeacher: boolean): void {
    let { newLeaf, v } = this.lastSplit!
    // todo: verify following lines
    // this.lastCe = { value: ce, accepted: !this.automaton!.acceptWord(newLeaf + v), isTeacher }
    this.lastCe = { value: newLeaf + v, accepted: !this.automaton!.acceptWord(newLeaf + v), isTeacher }
  }
}