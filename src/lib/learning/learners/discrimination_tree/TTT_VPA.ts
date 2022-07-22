import AlphabetVPA from "../../../automaton/context_free/AlphabetVPA";
import StateVPA from "../../../automaton/context_free/state_vpa";
import VPA from "../../../automaton/context_free/VPA";
import { todo, toEps } from "../../../tools";
import Teacher from "../../teachers/teacher";
import DiscTreeVPA, { StringCouple } from "./DiscTreeVPA";

export default class TTT_VPA {
  finish = false;
  lastCe: { value: string, accepted: boolean, isTeacher: boolean } | undefined;
  lastSplit: { u: string, a: string, v: string, uaState: string, uState: string } | undefined;
  teacher: Teacher;
  alphabet: AlphabetVPA;
  dataStructure: DiscTreeVPA;
  automaton: undefined | VPA;
  learner: TTT_VPA;

  constructor(teacher: Teacher, learner: TTT_VPA) {
    this.alphabet = learner.alphabet;
    this.teacher = teacher;
    this.dataStructure = new DiscTreeVPA(["", ""])
    this.learner = learner
    this.initiate()
  }

  initiate() {
    let root = this.dataStructure.getRoot();
    let [addedRight, addedLeft] = [false, false]
    let alph = this.alphabet
    for (const symbol of alph.INT) {
      if (addedRight && addedLeft) break
      if (this.teacher.member(symbol) && addedRight === false) {
        this.dataStructure.addRightChild({ parent: root, name: symbol });
        addedRight = true;
      } else if (addedLeft === false) {
        this.dataStructure.addLeftChild({ parent: root, name: symbol });
        addedLeft = true;
      }
    }
    this.makeAutomaton()
  }

  toStabilizeHypothesis(): boolean {
    return this.lastCe !== undefined &&
      this.automaton!.acceptWord(this.lastCe.value) !== this.lastCe.accepted
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
      ce = this.teacher.equiv(todo() && this.automaton!)
      isTeacher = true
    }
    if (ce === undefined) { this.finish = true; return }
    let { a, v, uaState, uState, u, newLeaf, newNodeLabel } = this.split_ce_in_uav(ce)
    this.lastSplit = { u, a, v, uaState: uaState!, uState: uState! }

    this.lastCe = { value: uState + a + v, accepted: !this.automaton!.acceptWord(uState + a + v), isTeacher: isTeacher }
    if (isTeacher) return
    this.dataStructure.splitLeaf({
      leafName: uaState!,
      nameLeafToAdd: uState + a,
      newDiscriminator: newNodeLabel,
      isTop: !this.automaton!.acceptWord(uaState + v)
    })
  }

  makeAutomaton(): VPA {
    let initial_state = this.dataStructure.sift("", this.teacher)!
    let states = new Map([...this.dataStructure.getLeaves().values()].map(e => [e.name,
    new StateVPA({
      name: e.name, isAccepting: e.isAccepting!, isInitial: e === initial_state, alphabet: this.alphabet, stackAlphabet: todo()
    })]))

    let L = [...states.keys()]

    while (L.length > 0) {
      const state = L.pop()!
      for (const symbol of [todo()]) {
        let newWord = state + symbol
        let res = this.dataStructure.sift(newWord, this.teacher)

        if (res === undefined) {
          res = this.dataStructure.addRoot(newWord)
          L.push(res.name)
          states.set(newWord, new StateVPA({ name: newWord, isAccepting: res.isAccepting!, isInitial: false, alphabet: this.alphabet, stackAlphabet: todo() }))
        }
        /** @todo TOP-STACK if it is a CALL / RET transition */
        states.get(state)!.addTransition({ symbol, successor: states.get(res.name)! })
      }
    }
    return (this.automaton = new VPA([...states.values()]))
  }

  /** @todo loop only over RET and INT symbols */
  split_ce_in_uav(ce: string) {
    let splitU_Hat = (uHat: string) => {
      let pos = uHat.length - 1, cnt = 0
      while (pos > -1) {
        let char = uHat[pos]
        if (this.alphabet.CALL.includes(char)) cnt--
        else if (this.alphabet.RET.includes(char)) cnt++
        if (cnt < 0) return { uPrime: uHat.substring(0, pos), u: uHat.substring(pos) }
      }
      throw new Error("You should not be here");
    }

    let uHat: string, aHat: string, vHat: string;
    for (let i = 0; i < ce.length; i++) {
      uHat = ce.substring(0, i);
      aHat = ce[i];
      vHat = ce.substring(i + 1);
      let uState = this.automaton!.giveState(uHat)?.name
      let uaState = this.automaton!.giveState(uHat + aHat)?.name
      if (this.teacher.member(uState + aHat + vHat) !== this.teacher.member(uaState + vHat)) {
        let { u, uPrime } = splitU_Hat(uHat);
        uaState = this.automaton?.giveState(u + aHat)?.name
        let newNodeLabel: StringCouple = [uPrime, vHat]
        let newLeaf = uPrime + aHat
        return { u: uHat, a: aHat, v: vHat, uaState, uState, newNodeLabel, newLeaf }
      }
    }
    throw new Error("Invalid counter-example")
  }

  splitToString() {
    let [u, a, v, uState, uaState] = [toEps(this.lastSplit!.u), this.lastSplit!.a, toEps(this.lastSplit!.v), toEps(this.lastSplit!.uState), toEps(this.lastSplit!.uaState)]
    return `The conunter-example could be split into ${u + "." + a + "." + v} because (${"⌊" + u + "⌋." + a + "." + v} = ${uState + "." + a + "." + v}) ≠ (${"⌊" + u + "." + a + "⌋." + v} = ${uaState + "." + v})`;
  }
}