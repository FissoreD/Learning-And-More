import AlphabetVPA from "../../../automaton/context_free/AlphabetVPA";
import ONE_SEVPA from "../../../automaton/context_free/ONE_SEVPA";
import StateVPA from "../../../automaton/context_free/StateVPA";
import VPA from "../../../automaton/context_free/VPA";
import { toEps } from "../../../tools";
import Teacher from "../../teachers/Teacher";
import DiscTreeVPA, { StringCouple } from "./DiscTreeVPA";
import TTT_Father from "./TTT_Father";

export default class TTT_VPA extends TTT_Father<StringCouple, StateVPA> {
  finish = false;
  lastCe: { value: string, accepted: boolean, isTeacher: boolean } | undefined;
  lastSplit: { u: string; a: string; v: string; uaState: string | undefined; uState: string | undefined; newNodeLabel: StringCouple; newLeaf: string; } | undefined;
  alphabet: AlphabetVPA;

  constructor(teacher: Teacher<StateVPA>) {
    super(teacher, new DiscTreeVPA(["", ""]))
    this.alphabet = teacher.alphabet as AlphabetVPA;
    this.initiate()
  }

  initiate() {
    let root = this.dataStructure.getRoot();
    let [addedRight, addedLeft] = [false, false]
    let alph = this.alphabet as AlphabetVPA
    let addChild = (symbol: string) => {
      let isOk = this.teacher.member(symbol)
      if (isOk && addedRight === false) {
        this.dataStructure.addRightChild({ parent: root, name: symbol });
        addedRight = true;
      } else if (!isOk && addedLeft === false) {
        this.dataStructure.addLeftChild({ parent: root, name: symbol });
        addedLeft = true;
      }
    }
    for (const symbol of ["", ...alph.INT]) {
      if (addedRight && addedLeft) break
      addChild(symbol)
    }
    for (const call of alph.CALL) {
      for (const ret of alph.RET) {
        if (addedRight && addedLeft) break
        let symbol = call + ret
        addChild(symbol)
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
      ce = this.teacher.equiv(this.automaton!)
      isTeacher = true
    }
    if (ce === undefined) { this.finish = true; return }
    let { a, v, uaState, uState, u, newLeaf, newNodeLabel } = this.split_ce_in_uav(ce)
    this.lastSplit = { a, v, uaState, uState, u, newLeaf, newNodeLabel }

    this.lastCe = { value: newLeaf + v, accepted: !this.automaton!.acceptWord(newLeaf + v), isTeacher }
    if (isTeacher) return
    this.dataStructure.splitLeaf({
      leafName: uaState!,
      nameLeafToAdd: newLeaf,
      newDiscriminator: newNodeLabel,
      isTop: !this.automaton!.acceptWord(uaState + v)
    })
  }

  makeAutomaton(): VPA {
    let initial_state = this.dataStructure.sift("", this.teacher)!
    let stackAlphabet: string[] = []
    let states = new Map([...this.dataStructure.getLeaves().values()].map(e => [e.name,
    new StateVPA({
      name: e.name, isAccepting: e.isAccepting!, isInitial: e === initial_state,
      alphabet: this.alphabet, stackAlphabet
    })]))

    let L = [...states.keys()]

    let updateAutomaton = (newWord: string) => {
      let res = this.dataStructure.sift(newWord, this.teacher)

      if (res === undefined) {
        res = this.dataStructure.addRoot(newWord)
        L.push(res.name)
        states.set(newWord, new StateVPA({ name: newWord, isAccepting: res.isAccepting!, isInitial: false, alphabet: this.alphabet, stackAlphabet }))
      }
      return res
    }

    while (L.length > 0) {
      const state = L.pop()!
      for (const symbol of this.alphabet.INT) {
        let newWord = state + symbol
        let res = updateAutomaton(newWord)
        states.get(state)!.addTransition({ symbol, successor: states.get(res.name)! })
      }
      for (const pred of states.keys()) {
        for (const call of this.alphabet.CALL) {
          for (const ret of this.alphabet.RET) {
            let newWord = pred + call + state + ret
            let res = updateAutomaton(newWord)
            states.get(state)!.addTransition({ symbol: ret, successor: states.get(res.name)!, topStack: `(${toEps(pred)},${toEps(call)})` })
            if (!stackAlphabet.includes(`(${toEps(pred)},${toEps(call)})`))
              stackAlphabet.push(`${toEps(pred)},${toEps(call)}`)
          }
        }
      }
    }
    return (this.automaton = new ONE_SEVPA([...states.values()]))
  }

  /** @todo loop only over RET and INT symbols */
  split_ce_in_uav(ce: string) {

    // console.log(this.dataStructure.toDot());
    // console.log(this.automaton.toDot());
    // console.log({ ce });

    let splitU_Hat = (uHat: string) => {
      let pos = uHat.length - 1, cnt = 0
      // console.log({ ce, uHat });

      while (pos > -1) {
        let char = uHat[pos]
        if (this.alphabet.CALL.includes(char)) cnt--
        else if (this.alphabet.RET.includes(char)) cnt++
        if (cnt < 0) return { uPrime: uHat.substring(0, pos), u: uHat.substring(pos) }
        pos--;
      }
      return { uPrime: "", u: uHat }
      // throw new Error("You should not be here");
    }

    let uHat: string, aHat: string, vHat: string;
    for (let i = 0; i < ce.length; i++) {
      uHat = ce.substring(0, i);
      aHat = ce[i];
      vHat = ce.substring(i + 1);
      let uState = this.automaton!.giveState(uHat)?.name
      let uaState = this.automaton!.giveState(uHat + aHat)?.name
      if (this.teacher.member(uState + aHat + vHat) !== this.teacher.member(uaState + vHat)) {
        let { uPrime, u } = splitU_Hat(uHat);
        // console.log({ uPrime, u });

        uaState = this.automaton?.giveState(u + aHat)?.name
        let newNodeLabel: StringCouple = [uPrime, vHat]
        let newLeaf = u + aHat
        return { u: uHat, a: aHat, v: vHat, uaState, uState, newNodeLabel, newLeaf }
      }
    }
    throw new Error("Invalid counter-example")
  }
}