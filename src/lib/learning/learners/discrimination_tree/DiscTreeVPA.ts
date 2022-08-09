import { toEps } from "../../../tools";
import Teacher from "../../teachers/Teacher";
import DiscTreeFather from "./DiscTreeFather";
import { InnerNode } from "./tree_elt/InnerNode";
import { Leaf } from "./tree_elt/Leaf";
import { TreeElt } from "./tree_elt/TreeElt";

export default class DiscTreeVPA extends DiscTreeFather<StringCouple> {
  nodeNameToString(node: TreeElt<StringCouple>): string {
    if (node instanceof InnerNode)
      return `${toEps(node.name[0])},${toEps(node.name[1])}`
    return toEps(node.name)
  }


  newChild(name: StringCouple): DiscTreeFather<StringCouple> {
    return new DiscTreeVPA(name)
  }

  sift(word: string, teacher: Teacher): Leaf<StringCouple> | undefined {
    let currentNode: InnerNode<StringCouple> | Leaf<StringCouple> | undefined = this.root;
    while (currentNode instanceof InnerNode) {
      currentNode = teacher.member(currentNode.name[0] + word + currentNode.name[1]) ? currentNode.right : currentNode.left
    }
    return currentNode
  }
}