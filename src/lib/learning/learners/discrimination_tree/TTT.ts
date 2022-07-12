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
  last_ce: { value: string, accepted: boolean } | undefined;

  constructor(alphabet: string[] | string, teacher: Teacher) {
    this.teacher = teacher;
    this.alphabet = [...alphabet];
    this.disc_tree = new DiscriminationTree("");
    this.initiate()
    this.last_ce = undefined;
  }

  initiate() {
    let root = this.disc_tree.get_root();
    let [added_right, added_left] = [false, false]
    for (const symbol of ["", ...this.alphabet]) {
      if (added_right && added_left) break
      if (this.teacher.member(symbol) && added_right === false) {
        this.disc_tree.add_right_child({ parent: root, name: symbol });
        added_right = true;
      } else if (added_left === false) {
        this.disc_tree.add_left_child({ parent: root, name: symbol });
        added_left = true;
      }
    }
  }

  make_next_query() {
    if (this.finish) return
    this.automaton = this.make_automaton()
    let ce: string | undefined;
    if (this.last_ce &&
      this.automaton.accept_word(this.last_ce.value) != this.last_ce.accepted) {
      ce = this.last_ce.value;
    } else {
      ce = this.teacher.equiv(this.automaton)
    }
    if (ce === undefined) this.finish = true
    else {
      let { a, u, v, ua_state, u_state } = this.split_ce_in_uav(ce)
      // console.log({ leaf_to_split });

      this.last_ce = { value: a + v, accepted: this.teacher.member(a + v) }

      this.disc_tree.split_leaf({
        leaf_name: ua_state!,
        name_leaf_to_add: u_state + a,
        new_discriminator: v,
        is_top: !this.automaton.accept_word(ua_state + v)
      })
    }
  }

  make_all_queries() {
    while (!this.finish) {
      this.make_next_query();
    }
  }

  make_automaton(): Automaton {
    let initial_state = this.disc_tree.sift("", this.teacher)!
    let states = new Map([...this.disc_tree.get_leaves().values()].map(e => [e.name, new State(e.name, e.is_accepting!, e === initial_state, this.alphabet)]))

    let L = [...states.keys()]
    // console.log(this.disc_tree.toString());


    while (L.length > 0) {
      const state = L.pop()!
      for (const symbol of this.alphabet) {
        let new_word = state + symbol
        let res = this.disc_tree.sift(new_word, this.teacher)
        // console.log({ res });

        if (res === undefined) {
          console.log("Found undefined");
          res = this.disc_tree.add_root(new_word)
          L.push(res.name)
          states.set(new_word, new State(new_word, res.is_accepting!, false, this.alphabet))
        }
        states.get(state)!.add_transition(symbol, states.get(res.name)!)
      }
    }
    return new Automaton([...states.values()])
  }

  split_ce_in_uav(ce: string) {
    let u: string, a: string, v: string;
    for (let i = 0; i < ce.length; i++) {
      u = ce.substring(0, i);
      a = ce[i];
      v = ce.substring(i + 1);
      let u_state = this.automaton!.give_state(u)?.name
      let ua_state = this.automaton!.give_state(u + a)?.name
      if (this.teacher.member(u_state + a + v) != this.teacher.member(ua_state + v)) {
        return { u, a, v, ua_state, u_state }
      }
    }
    throw new Error("Invalid counter-example")
  }
}