import FSM_interface from "../../../automaton/FSM_interface";
import Teacher from "../../teachers/Teacher";
import LearnerFather from "../LearnerFather";
import DiscTreeFather from "./DiscTreeFather";

export default abstract class TTT_Father<LblType, StateType> extends LearnerFather<DiscTreeFather<LblType, StateType>, StateType>{
  lastCe: { value: string, accepted: boolean, isTeacher: boolean } | undefined;

  constructor(teacher: Teacher<StateType>, discTree: DiscTreeFather<LblType, StateType>) {
    super(teacher, discTree)
    this.initiate()
    this.makeAutomaton()
    this.makeNextQuery()
  }

  abstract initiate(): void;
  abstract makeAutomaton(): FSM_interface<StateType>;
  abstract makeNextQuery(): void;


  toStabilizeHypothesis(): boolean {
    return this.lastCe !== undefined &&
      this.automaton!.acceptWord(this.lastCe.value) !== this.lastCe.accepted
  }
}