import Automaton from "../../automaton/fsm/DFA_NFA";
import Teacher from "../teachers/teacher";

export default abstract class LearnerFather<DataStType> {
  alphabet: string[];
  memberNumber = 0;
  equivNumber = 0;
  finish = false;
  automaton: undefined | Automaton;
  teacher: Teacher;
  dataStructure: DataStType;

  constructor(teacher: Teacher, dataStructure: DataStType) {
    this.alphabet = [...teacher.alphabet];
    this.teacher = teacher;
    this.dataStructure = dataStructure;
  }

  /**
   * Takes in parameter an {@link Automaton} and ask 
   * to the teacher if the automaton knows the language.
   * If so : the Learner has learnt the language
   * Else : it appends the counter-example to {@link S}
   * @param a an Automaton
   * @returns undefined if {@link a} recognize the teacher's language, a counter-example (as a string) otherwise.
   */
  makeEquiv(a: Automaton) {
    let answer = this.teacher.equiv(a);
    this.equivNumber++;
    return answer;
  }

  abstract makeAutomaton(): Automaton;
  abstract makeNextQuery(): void;

  makeAllQueries() {
    while (!this.finish) {
      this.makeNextQuery();
    }
  }

  getMemberNumber() {
    return this.memberNumber;
  }

  getEquivNumber() {
    return this.equivNumber;
  }

  getStateNumber() {
    return this.automaton!.getStateNumber()
  }

  getTransitionNumber() {
    return this.automaton!.getTransitionNumber()
  }
}