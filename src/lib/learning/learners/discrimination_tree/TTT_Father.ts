import FSM_interface from "../../../automaton/FSM_interface";
import Teacher from "../../teachers/Teacher";
import LearnerFather from "../LearnerFather";
import DiscTreeFather from "./DiscTreeFather";

export type LastSplitType<LblType> = { u: string; a: string; v: string; uaState: string | undefined; uState: string | undefined; newNodeLabel: LblType; newLeaf: string; };


export default abstract class TTT_Father<LblType, StateType> extends LearnerFather<DiscTreeFather<LblType, StateType>, StateType>{
  lastSplit?: LastSplitType<LblType>;
  lastCe?: { value: string, accepted: boolean, isTeacher: boolean };

  constructor(teacher: Teacher<StateType>, discTree: DiscTreeFather<LblType, StateType>) {
    super(teacher, discTree)
    this.initiate()
    this.makeNextQuery()
  }

  abstract initiate(): void;
  abstract makeAutomaton(): FSM_interface<StateType>;
  abstract split_ce_in_uav(ce: string): LastSplitType<LblType>;

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

    this.lastSplit = this.split_ce_in_uav(ce)

    let { newLeaf, v, uaState, newNodeLabel } = this.lastSplit!;

    // todo : value should not be equal to ce ?
    this.lastCe = { value: ce, accepted: !this.automaton!.acceptWord(newLeaf + v), isTeacher }
    if (isTeacher) return
    this.dataStructure.splitLeaf({
      leafName: uaState!,
      nameLeafToAdd: newLeaf,
      newDiscriminator: newNodeLabel,
      isTop: !this.automaton!.acceptWord(uaState + v)
    })
  }

  toStabilizeHypothesis(): boolean {
    return this.lastCe !== undefined &&
      this.automaton!.acceptWord(this.lastCe.value) !== this.lastCe.accepted
  }
}