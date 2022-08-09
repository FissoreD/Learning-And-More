import { InnerNode } from "./InnerNode";


export class Leaf<LblType> {
  name: string;
  parent: InnerNode<LblType>;
  depth: number;
  isAccepting: boolean | undefined;
  constructor(p: { name: string; parent: InnerNode<LblType>; }) {
    this.name = p.name;
    this.parent = p.parent;
    this.depth = p.parent.depth + 1;
  }

  setParent(i: InnerNode<LblType>, isRight: boolean) {
    this.parent = i;
    this.isAccepting = this.isAcceptingMethod(i, isRight);
  }

  isAcceptingMethod(parent: InnerNode<LblType>, isRight: boolean): boolean {
    if (this.isAccepting !== undefined)
      return this.isAccepting;
    if (isRight && parent.parent === undefined)
      return true;
    while (parent.parent?.parent !== undefined) {
      parent = parent.parent;
    }
    if (parent?.parent?.right === parent)
      return true;
    return false;
  }

  isRight() {
    return this.parent.right === this;
  }
}
