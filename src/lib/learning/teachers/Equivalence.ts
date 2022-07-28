import FSM from "../../automaton/FSM_interface";
import DFA_NFA from "../../automaton/regular/DFA_NFA";
import StateDFA from "../../automaton/regular/StateDFA";
import Teacher from "./Teacher";

/**
 * let A = teacher.automaton, B = automaton
 * res = (A union B) / (A inter B)
 * @param teacher 
 * @param automaton 
 * @returns undifined if res = empty else the shortes word in res
 */
export let equivalenceFunction = (teacher: Teacher<string[], StateDFA>, automaton: DFA_NFA): string | undefined => {
  let counterExemple = (automatonDiff: FSM<string[], StateDFA>): string | undefined => {
    let stateList = automatonDiff.allStates()
    if (automatonDiff.acceptingStates().length === 0) return undefined;
    let toExplore = Array.from(automatonDiff.initialStates)
    let explored: StateDFA[] = []
    type parentChild = { parent: StateDFA | undefined, symbol: string }
    let parent: parentChild[] = new Array(stateList.length).fill({ parent: undefined, symbol: "" });
    while (toExplore.length > 0) {
      const current = toExplore.shift()!
      if (explored.includes(current)) continue;
      explored.push(current)
      for (const [symbol, states] of current.getAllOutTransitions()) {
        if (!explored.includes(states[0])) {
          parent[stateList.indexOf(states[0])] =
            { parent: current, symbol: symbol }
          if (!toExplore.includes(states[0])) toExplore.push(states[0])
        }
      }


      if (automatonDiff.acceptingStates().includes(current)) {
        let id = stateList.indexOf(current);
        let res: string[] = [parent[id].symbol]
        while (parent[id].parent) {
          id = stateList.indexOf(parent[id].parent!)
          res.push(parent[id].symbol)
        }
        return res.reverse().join("");
      }
    }
    return "";
  }

  let automMinimized = automaton.minimize();
  let diff1 = teacher.automaton!.difference(automMinimized);
  let counterEx1 = counterExemple(diff1);

  let diff2 = teacher.automaton!.difference(automMinimized);
  let counterEx2 = counterExemple(diff2);

  if (counterEx1 === undefined) return counterEx2;
  if (counterEx2 === undefined) return counterEx1;

  return counterEx1.length < counterEx2.length ? counterEx1 : counterEx2;
}