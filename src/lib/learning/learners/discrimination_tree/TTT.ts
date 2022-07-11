import { Automaton } from "../../../automaton/fsm/DFA_NFA";
import { State } from "../../../automaton/fsm/state";
import { Teacher } from "../../teachers/teacher";
import LearnerInterface from "../learner_inerface";
import DiscriminationTree from "./discrimination_tree";

export default class TTT implements LearnerInterface {
  disc_tree: DiscriminationTree;
  alphabet: string[];
  teacher: Teacher;
  member_number = 0;
  equiv_number = 0;
  finish = false;
  counter_example: string | undefined = "";
  automaton: undefined | Automaton;

  constructor(alphabet: string[] | string, teacher: Teacher) {
    this.teacher = teacher;
    this.alphabet = [...alphabet, ""];
    this.disc_tree = new DiscriminationTree("");
  }

  initiate() {
    let root = this.disc_tree.get_root();
    for (const symbol of this.alphabet) {
      if (root.left != undefined && root.right != undefined)
        break
      if (this.teacher.member(symbol)) {
        this.disc_tree.add_right_child({ parent: root, name: symbol })
      } else {
        this.disc_tree.add_left_child({ parent: root, name: symbol })
      }
    }
  }

  make_automaton(): Automaton {
    let initial_state = this.disc_tree.sift("", this.teacher)!
    let accepting_states = [... this.disc_tree.get_accepting_leaves()].map(e => e.name)
    let states = new Map([...this.disc_tree.get_leaves()].map(e => [e.name, new State(e.name, accepting_states.includes(e.name), e === initial_state, this.alphabet)]))

    let L = [...states.keys()]
    while (L.length > 0) {
      const state = L.pop()
      for (const symbol of this.alphabet) {
        let res = this.disc_tree.sift(state + symbol, this.teacher)
        if (res === undefined) {
          res = this.disc_tree.add_root(state + symbol)
          L.push(res.name)
        }
        states.get(res.name)!.add_transition(symbol, states.get(res.name)!)
      }
    }
    return new Automaton([...states.values()])
  }
}