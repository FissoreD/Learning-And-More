import { InnerNode } from "./InnerNode";
import { Leaf } from "./Leaf";

export type TreeElt<LblType> = InnerNode<LblType> | Leaf<LblType>;
