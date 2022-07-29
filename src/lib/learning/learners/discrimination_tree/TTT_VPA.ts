import AlphabetVPA from "../../../automaton/context_free/AlphabetVPA";
import StateVPA from "../../../automaton/context_free/StateVPA";
import VPA from "../../../automaton/context_free/VPA";
import { todo, toEps } from "../../../tools";
import Teacher from "../../teachers/Teacher";
import LearnerFather from "../LearnerFather";
import DiscTreeVPA, { StringCouple } from "./DiscTreeVPA";

export default class TTT_VPA extends LearnerFather<DiscTreeVPA, StateVPA> {
  finish = false;
  lastCe: { value: string, accepted: boolean, isTeacher: boolean } | undefined;
  lastSplit: { u: string, a: string, v: string, uaState: string, uState: string } | undefined;
  alphabet: AlphabetVPA;

  constructor(teacher: Teacher<StateVPA>) {
    super(teacher, new DiscTreeVPA(["", ""]))
    this.alphabet = teacher.alphabet as AlphabetVPA;
    this.teacher = teacher;
    this.dataStructure = new DiscTreeVPA(["", ""])
    this.initiate()
  }

  initiate() {
    let root = this.dataStructure.getRoot();
    let [addedRight, addedLeft] = [false, false]
    let alph = this.alphabet as AlphabetVPA
    for (const symbol of ["", ...alph.INT]) {
      if (addedRight && addedLeft) break
      let isOk = this.teacher.member(symbol)
      if (isOk && addedRight === false) {
        this.dataStructure.addRightChild({ parent: root, name: symbol });
        addedRight = true;
      } else if (!isOk && addedLeft === false) {
        this.dataStructure.addLeftChild({ parent: root, name: symbol });
        addedLeft = true;
      }
    }
    for (const call of alph.CALL) {
      for (const ret of alph.RET) {
        if (addedRight && addedLeft) break
        let isOk = this.teacher.member(call + ret)
        if (isOk && addedRight === false) {
          this.dataStructure.addRightChild({ parent: root, name: `${call},${ret}` });
          addedRight = true;
        } else if (!isOk && addedLeft === false) {
          this.dataStructure.addLeftChild({ parent: root, name: `${call},${ret}` });
          addedLeft = true;
        }
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
    let stackAlphabet: string[] = []
    let states = new Map([...this.dataStructure.getLeaves().values()].map(e => [e.name,
    new StateVPA({
      name: e.name, isAccepting: e.isAccepting!, isInitial: e === initial_state,
      alphabet: this.alphabet, stackAlphabet
    })]))

    let L = [...states.keys()]

    while (L.length > 0) {
      const state = L.pop()!
      /**
       * TODO: 
       * boucler sur les lettres INT avec append sur le label de l'état courant
       * boucler sur les couple (l1, l2) such that l1 \in CALL and l2 \in RET
       *         et tester si l1.(label de l'etat).l2 with member question
       */
      for (const symbol of this.alphabet.INT) {
        let newWord = state + symbol
        let res = this.dataStructure.sift(newWord, this.teacher)

        if (res === undefined) {
          res = this.dataStructure.addRoot(newWord)
          L.push(res.name)
          states.set(newWord, new StateVPA({ name: newWord, isAccepting: res.isAccepting!, isInitial: false, alphabet: this.alphabet, stackAlphabet }))
        }
        /** @todo TOP-STACK if it is a CALL / RET transition */
        states.get(state)!.addTransition({ symbol, successor: states.get(res.name)! })
      }
      for (const pred of states.keys()) {
        for (const call of this.alphabet.CALL) {
          for (const ret of this.alphabet.RET) {
            let newWord = pred + call + state + ret
            let res = this.dataStructure.sift(newWord, this.teacher)

            if (res === undefined) {
              res = this.dataStructure.addRoot(newWord)
              L.push(res.name)
              states.set(newWord, new StateVPA({ name: newWord, isAccepting: res.isAccepting!, isInitial: false, alphabet: this.alphabet, stackAlphabet }))
            }
            states.get(state)!.addTransition({ symbol: ret, successor: states.get(res.name)!, topStack: `(${toEps(pred)},${toEps(call)})` })
            stackAlphabet.push(`${pred},${call}`)
          }
        }
      }
    }
    stackAlphabet = [...new Set(stackAlphabet)]
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