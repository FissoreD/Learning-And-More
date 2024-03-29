import Alphabet from "../../automaton/Alphabet.interface";
import FSM from "../../automaton/FSM.interface";
import Teacher from "../teachers/Teacher";
import DataStructure from "./DataStructure.interface";

export default abstract class LearnerFather {
  alphabet: Alphabet;
  memberNumber = 0;
  equivNumber = 0;
  finish = false;
  automaton: undefined | FSM;
  teacher: Teacher;
  protected dataStructure: DataStructure;

  constructor(teacher: Teacher, dataStructure: DataStructure) {
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
  makeEquiv(a: FSM) {
    let answer = this.teacher.equiv(a);
    this.equivNumber++;
    return answer;
  }
  abstract makeAutomaton(): FSM;
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

  abstract getDataStructure(): DataStructure;
}