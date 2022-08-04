import FSM_interface from "../../../automaton/FSM_interface";
import LearnerFather from "../LearnerFather";
import DiscTreeFather from "./DiscTreeFather";

export default abstract class TTT_Father<A, B> extends LearnerFather<DiscTreeFather<A, B>, B>{
  abstract makeAutomaton(): FSM_interface<B>;

  abstract makeNextQuery(): void;
}