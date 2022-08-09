import FSM_interface from "../../../automaton/FSM.interface";
import Teacher from "../../teachers/Teacher";
import LearnerFather from "../LearnerFather";
import DiscTreeFather from "./DiscTreeFather";

export type LastSplitType<LblType> = { u: string; a: string; v: string; uaState: string | undefined; uState: string | undefined; newNodeLabel: LblType; newLeaf: string; };


export default abstract class TTT_Father<LblType> extends LearnerFather {
  lastSplit?: LastSplitType<LblType>;
  lastCe?: { value: string, accepted: boolean, isTeacher: boolean };

  constructor(teacher: Teacher, discTree: DiscTreeFather<LblType>) {
    super(teacher, discTree)
    this.initiate()
    this.makeNextQuery()
  }

  abstract initiate(): void;
  abstract makeAutomaton(): FSM_interface;
  abstract split_ce_in_uav(ce: string): LastSplitType<LblType>;
  abstract updateCe(ce: string, isTeacher: boolean): void;

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

    this.updateCe(ce, isTeacher)

    if (isTeacher) return

    this.updateTree(this.lastSplit)
  }

  updateTree(p: { newLeaf: string, v: string, uaState?: string, newNodeLabel: LblType }) {
    (this.dataStructure as DiscTreeFather<LblType>).splitLeaf({
      leafName: p.uaState!,
      nameLeafToAdd: p.newLeaf,
      newDiscriminator: p.newNodeLabel,
      isTop: this.lastCe!.accepted
    })
  }

  toStabilizeHypothesis(): boolean {
    return this.lastCe !== undefined &&
      this.automaton!.acceptWord(this.lastCe.value) !== this.lastCe.accepted
  }
}