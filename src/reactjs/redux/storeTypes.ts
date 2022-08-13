import FSM from "../../lib/automaton/FSM.interface";
import { LearnerType } from "../pages/learning/LearnerPage";

export type Operation = "\u222a" | "∩" | "△" | "/" | "Det" | "~"
export type FSM_Type = 'VPA' | 'DFA'
export type AlgosNavBarType = "Home" | "Automaton" | "Learning"

export const ALGO_NAVBAR_LIST: AlgosNavBarType[] = ["Home", "Automaton", "Learning"]


export interface StoreLearnerInterface {
  algos: Record<LearnerType, string>;
  pos: Record<LearnerType, number>;
  currentAlgo: LearnerType;
};

export interface StoreAutomataInterface {
  content: {
    [fsm in FSM_Type]: { a1: FSM, a2: FSM, res: FSM, lastOp: Operation, is_a1: boolean }
  };
  currentType: FSM_Type;
}

export interface StoreInterface {
  learner: StoreLearnerInterface;
  automata: StoreAutomataInterface;
  currentPage: AlgosNavBarType
}