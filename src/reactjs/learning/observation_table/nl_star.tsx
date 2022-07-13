import LearnerOTBase from "../../../lib/learning/learners/observation_table/learner_ot_base";
import { NL_star } from "../../../lib/learning/learners/observation_table/nl_star";
import { TeacherAutomaton } from "../../../lib/learning/teachers/teacher_automaton";
import { to_eps } from "../../../lib/tools";
import { PropReact } from "../learner_sectionC";
import LearnerOTBaseC from "./learner_OT_baseC";

export default class NLStarC extends LearnerOTBaseC {
  create_new_learner(regex: string): NL_star {
    return new NL_star(new TeacherAutomaton({ type: "Regex", automaton: regex }))
  }

  constructor(prop: PropReact<LearnerOTBase>) {
    super(prop, "E")
  }
  close_message(close_rep: string) {
    return `The table is not closed since row(${close_rep}) is Prime and is not present in S.
    "${close_rep}" will be moved from SA to S.`;
    // `The table is not closed since there is row(${close_rep}) = "${row}" where "${close_rep}" is in SA and there is no row s in S such that s ⊑ ${row}.
    // "${close_rep}" will be moved from SA to S.`;
  }

  consistent_message(s1: string, s2: string, new_col: string) {
    let fstChar = new_col[0],
      sndChar = new_col.length === 1 ? "ε" : new_col.substring(1);
    return `The table is not consistent since :
        row(${to_eps(s1)}) ⊑ row(${to_eps(s2)}) but row(${s1 + new_col[0]}) ⋢ row(${s2 + new_col[0]});
        The column "${fstChar} ∘ ${sndChar}" will be added in E since T(${to_eps(s1)} ∘ ${new_col}) ⋢ T(${to_eps(s2)} ∘ ${new_col})`
    // `The table is not consistent since :
    //     row(${s1 ? s1 : "ε"}) ⊑ row(${s2 ? s2 : "ε"}) where ${s1 ? s1 : "ε"}, ${s2 ? s2 : "ε"} ∈ S but row(${s1 + new_col[0]}) ⋢ row(${s2 + new_col[0]});
    //     The column "${new_col}" will be added in E since T(${s1 + new_col}) ≠ T(${s2 + new_col}) 
    //     [Note : ${new_col} = ${fstChar} ∘ ${sndChar} and ${fstChar} ∈ Σ and ${sndChar} ∈ E]`
  }
}