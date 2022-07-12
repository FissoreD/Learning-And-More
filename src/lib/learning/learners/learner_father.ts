import Automaton from "../../automaton/fsm/DFA_NFA";
import Teacher from "../teachers/teacher";

export default abstract class LearnerFather<DataStType> {
  alphabet: string[];
  member_number = 0;
  equiv_number = 0;
  finish = false;
  automaton: undefined | Automaton;
  teacher: Teacher;
  data_structure: DataStType;

  constructor(teacher: Teacher, data_structure: DataStType) {
    this.alphabet = [...teacher.alphabet];
    this.teacher = teacher;
    this.data_structure = data_structure;
  }

  /**
   * Takes in parameter an {@link Automaton} and ask 
   * to the teacher if the automaton knows the language.
   * If so : the Learner has learnt the language
   * Else : it appends the counter-example to {@link S}
   * @param a an Automaton
   * @returns undefined if {@link a} recognize the teacher's language, a counter-example (as a string) otherwise.
   */
  make_equiv(a: Automaton) {
    let answer = this.teacher.equiv(a);
    this.equiv_number++;
    return answer;
  }

  abstract make_automaton(): Automaton;
  abstract make_next_query(): void;

  make_all_queries() {
    while (!this.finish) {
      this.make_next_query();
    }
  }

  get_member_number() {
    return this.member_number;
  }

  get_equiv_number() {
    return this.equiv_number;
  }

  get_state_number() {
    return this.automaton!.state_number()
  }

  get_transition_number() {
    return this.automaton!.transition_number()
  }
}