import Clonable from "../../Clonable.interface";
import ToDot from "../../ToDot.interface";
import ToString from "../../ToString.interface";

export default interface DataStructure extends ToString, ToDot, Clonable<DataStructure> {

}