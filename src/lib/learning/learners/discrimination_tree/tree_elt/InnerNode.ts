import { Leaf } from "./Leaf";

export class InnerNode<LblType> {
  name: LblType;
  right: InnerNode<LblType> | Leaf<LblType> | undefined;
  left: InnerNode<LblType> | Leaf<LblType> | undefined;
  parent: InnerNode<LblType> | undefined;
  depth = 0;
  constructor(p: {
    name: LblType;
    right?: InnerNode<LblType> | Leaf<LblType>;
    left?: InnerNode<LblType> | Leaf<LblType>;
    parent?: InnerNode<LblType>;
  }) {
    this.name = p.name;
    this.right = p.right;
    this.left = p.left;
    this.parent = p.parent;
    this.depth = p.parent?.depth || 0;
  }

  addRightLeaf(l: Leaf<LblType>) {
    this.right = l;
    l.setParent(this, true);
  }

  addLeftLeaf(l: Leaf<LblType>) {
    this.left = l;
    l.setParent(this, false);
  }
}
