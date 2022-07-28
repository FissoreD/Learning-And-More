import FSM from "../../automaton/FSM_interface";
import Teacher from "../teachers/Teacher";

export default abstract class LearnerFather<DataStType, AlphabetType, StateType> {
  alphabet: AlphabetType;
  memberNumber = 0;
  equivNumber = 0;
  finish = false;
  automaton: undefined | FSM<AlphabetType, StateType>;
  teacher: Teacher<AlphabetType, StateType>;
  dataStructure: DataStType;

  constructor(teacher: Teacher<AlphabetType, StateType>, dataStructure: DataStType) {
    this.alphabet = teacher.alphabet;
    this.teacher = teacher;
    this.dataStructure = dataStructure;
  }

  /**
   * Takes in parameter a FSM and ask 
   * to the teacher if the automaton knows the language.
   * If so : the Learner has learnt the language
   * Else : it appends the counter-example to {@link S}
   * @param a an Automaton
   * @returns undefined if {@link a} recognize the teacher's language, a counter-example (as a string) otherwise.
   */
  makeEquiv(a: FSM<AlphabetType, StateType>) {
    let answer = this.teacher.equiv(a);
    this.equivNumber++;
    return answer;
  }

  abstract makeAutomaton(): FSM<AlphabetType, StateType>;
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