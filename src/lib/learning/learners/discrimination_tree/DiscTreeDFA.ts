import StateDFA from "../../../automaton/regular/StateDFA";
import { toEps } from "../../../tools";
import Teacher from "../../teachers/Teacher";
import DiscTreeFather, { InnerNode, Leaf, TreeElt } from "./DiscTreeFather";

export default class DiscTreeDFA extends DiscTreeFather<string, StateDFA> {
  nodeNameToString(node: TreeElt<string>): string {
    return toEps(node.name)
  }

  newChild(name: string): DiscTreeFather<string, StateDFA> {
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