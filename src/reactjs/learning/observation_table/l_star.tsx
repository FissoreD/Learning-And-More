import { to_eps } from "../../../lib/tools";
import { Learner } from "../learnerSection";

export class LStarC extends Learner {
  close_message(close_rep: string) {
    return `The table is not closed since row(${close_rep}) is not present in S.
    "${close_rep}" will be moved from SA to S.`
  }

  consistent_message(s1: string, s2: string, new_col: string) {
    let fstChar = new_col[0],
      sndChar = new_col.length === 1 ? "ε" : new_col.substring(1);
    return `The table is not consistent since:
    row(${to_eps(s1)}) = row(${to_eps(s2)}) but row(${s1 + new_col[0]}) ≠ row(${s2 + new_col[0]});
        The column "${fstChar} ∘ ${sndChar}" will be added in E since T(${to_eps(s1)} ∘ ${new_col}) ≠ T(${to_eps(s2)} ∘ ${new_col})`
  }
}