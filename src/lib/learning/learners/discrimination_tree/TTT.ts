import Automaton from "../../../automaton/fsm/DFA_NFA";
import State from "../../../automaton/fsm/state";
import { to_eps } from "../../../tools";
import Teacher from "../../teachers/teacher";
import LearnerFather from "../learner_father";
import DiscriminationTree from "./discrimination_tree";

export default class TTT extends LearnerFather<DiscriminationTree> {
  finish = false;
  last_ce: { value: string, accepted: boolean, is_teacher: boolean } | undefined;
  last_split: { u: string, a: string, v: string, ua_state: string, u_state: string } | undefined;

  constructor(teacher: Teacher) {
    super(teacher, new DiscriminationTree(""))
    this.initiate()
  }

  initiate() {
    let root = this.data_structure.get_root();
    let [added_right, added_left] = [false, false]
    for (const symbol of ["", ...this.alphabet]) {
      if (added_right && added_left) break
      if (this.teacher.member(symbol) && added_right === false) {
        this.data_structure.add_right_child({ parent: root, name: symbol });
        added_right = true;
      } else if (added_left === false) {
        this.data_structure.add_left_child({ parent: root, name: symbol });
        added_left = true;
      }
    }
    this.make_automaton()
  }

  to_stabilize_hypothesis(): boolean {
    return this.last_ce !== undefined &&
      this.automaton!.accept_word(this.last_ce.value) !== this.last_ce.accepted
  }

  make_next_query() {
    if (this.finish) return
    let ce: string | undefined;
    let is_teacher: boolean;
    this.make_automaton()
    if (this.to_stabilize_hypothesis()) {
      ce = this.last_ce!.value;
      is_teacher = false;
    } else {
      ce = this.teacher.equiv(this.automaton!)
      is_teacher = true
    }
    if (ce === undefined) { this.finish = true; return }
    let { a, v, ua_state, u_state, u } = this.split_ce_in_uav(ce)
    this.last_split = { u, a, v, ua_state: ua_state!, u_state: u_state! }

    this.last_ce = { value: u_state + a + v, accepted: !this.automaton!.accept_word(u_state + a + v), is_teacher }
    if (is_teacher) return
    this.data_structure.split_leaf({
      leaf_name: ua_state!,
      name_leaf_to_add: u_state + a,
      new_discriminator: v,
      is_top: !this.automaton!.accept_word(ua_state + v)
    })
  }

  make_automaton(): Automaton {
    let initial_state = this.data_structure.sift("", this.teacher)!
    let states = new Map([...this.data_structure.get_leaves().values()].map(e => [e.name, new State(e.name, e.is_accepting!, e === initial_state, this.alphabet)]))

    let L = [...states.keys()]

    while (L.length > 0) {
      const state = L.pop()!
      for (const symbol of this.alphabet) {
        let new_word = state + symbol
        let res = this.data_structure.sift(new_word, this.teacher)

        if (res === undefined) {
          res = this.data_structure.add_root(new_word)
          L.push(res.name)
          states.set(new_word, new State(new_word, res.is_accepting!, false, this.alphabet))
        }
        states.get(state)!.add_transition(symbol, states.get(res.name)!)
      }
    }
    return (this.automaton = new Automaton([...states.values()]))
  }

  split_ce_in_uav(ce: string) {
    let u: string, a: string, v: string;
    for (let i = 0; i < ce.length; i++) {
      u = ce.substring(0, i);
      a = ce[i];
      v = ce.substring(i + 1);
      let u_state = this.automaton!.give_state(u)?.name
      let ua_state = this.automaton!.give_state(u + a)?.name
      if (this.teacher.member(u_state + a + v) !== this.teacher.member(ua_state + v)) {
        return { u, a, v, ua_state, u_state }
      }
    }
    throw new Error("Invalid counter-example")
  }

  split_to_string() {
    let [u, a, v, u_state, ua_state] = [to_eps(this.last_split!.u), this.last_split!.a, to_eps(this.last_split!.v), to_eps(this.last_split!.u_state), to_eps(this.last_split!.ua_state)]
    return `The conunter-example could be split into ${u + "." + a + "." + v} because (${"⌊" + u + "⌋." + a + "." + v} = ${u_state + "." + a + "." + v}) ≠ (${"⌊" + u + "." + a + "⌋." + v} = ${ua_state + "." + v})`;
  }
}