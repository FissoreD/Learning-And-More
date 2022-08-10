import { LearnerType } from "../pages/learning/LearnerPage";

export type Operation = "\u222a" | "∩" | "△" | "/" | "Det" | "~"
export type FSM_Type = 'VPA' | 'DFA'
export type AlgosNavBarType = "Home" | "Automaton" | "Learning"

export interface StoreLearnerInterface {
  algos: { [learnerType in LearnerType]: string };
  pos: { [learnerType in LearnerType]: number };
  currentAlgo: LearnerType;
};

export interface StoreAutomataInterface {
  cnt: { [fsm in FSM_Type]: { a1: string, a2: string, lastOp: Operation, is_a1: boolean } };
  currentType: FSM_Type
}

export interface StoreInterface {
  learner: StoreLearnerInterface;
  automata: StoreAutomataInterface;
  currentPage: AlgosNavBarType
}