import { toEps } from "../../../tools";
import Teacher from "../../teachers/teacher";
import DiscTreeFather, { InnerNode, Leaf, TreeElt } from "./DiscTreeFather";

type Generic = [string, string]

export default class DiscTreeVPA extends DiscTreeFather<Generic> {
  nodeNameToString(node: TreeElt<Generic>): string {
    if (node instanceof InnerNode)
      return `${toEps(node.name[0])},${toEps(node.name[1])}`
    return toEps(node.name)
  }


  newChild(name: Generic): DiscTreeFather<Generic> {
    return new DiscTreeVPA(name)
  }

  sift(word: string, teacher: Teacher): Leaf<Generic> | undefined {
    let currentNode: InnerNode<Generic> | Leaf<Generic> | undefined = this.root;
    while (currentNode instanceof InnerNode) {
      currentNode = teacher.member(currentNode.name[0] + word + currentNode.name[1]) ? currentNode.right : currentNode.left
    }
    return currentNode
  }
}