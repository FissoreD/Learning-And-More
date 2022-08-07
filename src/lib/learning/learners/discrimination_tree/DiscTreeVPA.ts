import StateVPA from "../../../automaton/context_free/StateVPA";
import { toEps } from "../../../tools";
import Teacher from "../../teachers/Teacher";
import DiscTreeFather, { InnerNode, Leaf, TreeElt } from "./DiscTreeFather";

export type StringCouple = [string, string]

export default class DiscTreeVPA extends DiscTreeFather<StringCouple, StateVPA> {
  nodeNameToString(node: TreeElt<StringCouple>): string {
    if (node instanceof InnerNode)
      return `${toEps(node.name[0])},${toEps(node.name[1])}`
    return toEps(node.name)
  }


  newChild(name: StringCouple): DiscTreeFather<StringCouple, StateVPA> {
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