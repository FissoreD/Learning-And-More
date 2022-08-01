import StateDFA from "../../../lib/automaton/regular/StateDFA";
import ClonableInterface from "../../../lib/Clonable.interface";
import { default as NL_Star, default as NL_star } from "../../../lib/learning/learners/observation_table/NL_Star";
import { TeacherAutomaton } from "../../../lib/learning/teachers/TeacherDFA";
import { toEps } from "../../../lib/tools";
import { PropReact } from "../LearnerSectionFatherC";
import Learner_OT_FatherC from "./Learner_OT_FatherC";

export default class NL_StarC extends Learner_OT_FatherC {
  createNewLearner(regex: string): NL_star {
    return new NL_star(new TeacherAutomaton({ type: "Regex", automaton: regex }))
  }

  dataStructureToNodeElement(ds: ClonableInterface) {
    return super.dataStructureToNodeElement(ds, (this.state.learner as NL_Star).primeLines)
  }

  constructor(prop: PropReact<StateDFA>) {
    super(prop, "E")
  }
  closeMessage(closeRep: string) {
    return <span>The table is not <i>closed</i> since row(<i>{closeRep}</i>) is <i>Prime</i> and is not present in <i>S</i>. "{closeRep}" will be moved from <i>SA</i> to <i>S</i>.</span >;
  }

  consistentMessage(s1: string, s2: string, newCol: string) {
    let fstChar = newCol[0],
      sndChar = newCol.length === 1 ? "ε" : newCol.substring(1);
    return <span>The table is not <i>consistent</i> since :
      row({toEps(s1)}) ⊑ row({toEps(s2)}) but row({s1 + newCol[0]}) ⋢ row({s2 + newCol[0]});
      The column "{fstChar} ∘ {sndChar}" will be added in <i>E</i> since T({toEps(s1)} ∘ {newCol}) ⋢ T({toEps(s2)} ∘ {newCol})</span>
  }
}