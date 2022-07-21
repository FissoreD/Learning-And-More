import Teacher from "../../teachers/teacher";
import DiscTreeFather, { InnerNode, Leaf } from "./DiscTreeFather";

export default class DiscTreeVPA extends DiscTreeFather {
  newChild(name: string): DiscTreeFather {
    return new DiscTreeVPA(name)
  }

  sift(word: string, teacher: Teacher): Leaf | undefined {
    let currentNode: InnerNode | Leaf | undefined = this.root;
    while (currentNode instanceof InnerNode) {
      currentNode = teacher.member(word + currentNode.name) ? currentNode.right : currentNode.left
    }
    return currentNode
  }
}