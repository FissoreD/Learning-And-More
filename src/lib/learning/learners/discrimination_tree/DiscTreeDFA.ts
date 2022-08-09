import { toEps } from "../../../tools";
import Teacher from "../../teachers/Teacher";
import DiscTreeFather from "./DiscTreeFather";
import { InnerNode } from "./tree_elt/InnerNode";
import { Leaf } from "./tree_elt/Leaf";
import { TreeElt } from "./tree_elt/TreeElt";

export default class DiscTreeDFA extends DiscTreeFather<string> {
  nodeNameToString(node: TreeElt<string>): string {
    return toEps(node.name)
  }

  newChild(name: string): DiscTreeFather<string> {
    return new DiscTreeDFA(name)
  }

  sift(word: string, teacher: Teacher): Leaf<string> | undefined {
    let currentNode: InnerNode<string> | Leaf<string> | undefined = this.root;
    while (currentNode instanceof InnerNode) {
      currentNode = teacher.member(word + currentNode.name) ? currentNode.right : currentNode.left
    }
    return currentNode
  }
}