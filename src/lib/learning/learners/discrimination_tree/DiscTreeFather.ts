import Clonable from "../../../Clonable.interface";
import ToDot from "../../../ToDot.interface";
import ToString from "../../../ToString.interface";
import Teacher from "../../teachers/Teacher";

export class InnerNode<LblType>  {
  name: LblType;
  right: InnerNode<LblType> | Leaf<LblType> | undefined;
  left: InnerNode<LblType> | Leaf<LblType> | undefined;
  parent: InnerNode<LblType> | undefined;
  depth = 0;
  constructor(p: {
    name: LblType,
    right?: InnerNode<LblType> | Leaf<LblType>,
    left?: InnerNode<LblType> | Leaf<LblType>,
    parent?: InnerNode<LblType>
  }) {
    this.name = p.name
    this.right = p.right
    this.left = p.left
    this.parent = p.parent
    this.depth = p.parent?.depth || 0
  }

  addRightLeaf(l: Leaf<LblType>) {
    this.right = l
    l.setParent(this, true)
  }

  addLeftLeaf(l: Leaf<LblType>) {
    this.left = l
    l.setParent(this, false)
  }
}

export class Leaf<LblType> {
  name: string
  parent: InnerNode<LblType>
  depth: number
  isAccepting: boolean | undefined;
  constructor(p: { name: string, parent: InnerNode<LblType> }) {
    this.name = p.name;
    this.parent = p.parent;
    this.depth = p.parent.depth + 1;
  }

  setParent(i: InnerNode<LblType>, isRight: boolean) {
    this.parent = i;
    this.isAccepting = this.isAcceptingMethod(i, isRight)
  }

  isAcceptingMethod(parent: InnerNode<LblType>, isRight: boolean): boolean {
    if (this.isAccepting !== undefined) return this.isAccepting
    if (isRight && parent.parent === undefined)
      return true
    while (parent.parent?.parent !== undefined) {
      parent = parent.parent
    }
    if (parent?.parent?.right === parent)
      return true
    return false
  }

  isRight() {
    return this.parent.right === this
  }
}

export type TreeElt<LblType> = InnerNode<LblType> | Leaf<LblType>

export default abstract class DiscTreeFather<LblType, StateType> implements Clonable, ToDot, ToString {
  protected root: InnerNode<LblType>;
  protected leaves: Map<string, Leaf<LblType>>;
  protected innerNodes: Set<InnerNode<LblType>>;

  constructor(rootName: LblType) {
    this.root = new InnerNode({ name: rootName })
    this.leaves = new Map()
    this.innerNodes = new Set([this.root])
  }

  lowestCommonAnchestor(te1: TreeElt<LblType>, te2: TreeElt<LblType>) {
    while (te1.depth > te2.depth) te1 = te1.parent!
    while (te1.depth < te2.depth) te2 = te2.parent!
    while (te1 !== te2) {
      te1 = te1.parent!
      te2 = te2.parent!
    }
    return te1
  }

  splitLeaf(p: { leafName: string, newDiscriminator: LblType, nameLeafToAdd: string, isTop: boolean }) {
    let leafToSplit = this.leaves.get(p.leafName)!
    let parent = leafToSplit.parent;
    let newInnerNode = new InnerNode<LblType>({ name: p.newDiscriminator, parent })
    this.innerNodes.add(newInnerNode)

    /* Set new child's parent after split */
    if (parent.right === leafToSplit) parent.right = newInnerNode
    else parent.left = newInnerNode

    let newLeaf = new Leaf({ name: p.nameLeafToAdd, parent: newInnerNode })

    let oldLeaf = leafToSplit

    this.leaves.set(newLeaf.name, newLeaf)
    if (p.isTop) {
      newInnerNode.addRightLeaf(newLeaf)
      newInnerNode.addLeftLeaf(oldLeaf)
    } else {
      newInnerNode.addLeftLeaf(newLeaf)
      newInnerNode.addRightLeaf(oldLeaf)
    }

    return newInnerNode;
  }

  addRightChild(p: { parent: InnerNode<LblType>, name: string }) {
    let newLeaf = new Leaf(p)
    p.parent.addRightLeaf(newLeaf)
    this.leaves.set(newLeaf.name, newLeaf)
    return newLeaf
  }

  addLeftChild(p: { parent: InnerNode<LblType>, name: string }) {
    let newLeaf = new Leaf(p)
    p.parent.addLeftLeaf(newLeaf)
    this.leaves.set(newLeaf.name, newLeaf)
    return newLeaf
  }

  getRoot() {
    return this.root;
  }

  getLeaves() {
    return this.leaves
  }

  getLeaf(leafName: string) {
    return this.leaves.get(leafName)
  }

  addRoot(s: string): Leaf<LblType> {
    if (this.root.right === undefined)
      return this.addRightChild({ parent: this.root, name: s })
    else
      return this.addLeftChild({ parent: this.root, name: s })
  }

  abstract sift(word: string, teacher: Teacher): Leaf<LblType> | undefined;
  abstract nodeNameToString(node: TreeElt<LblType>): string;

  toString() {
    let a = "";
    let toExplore: (InnerNode<LblType> | Leaf<LblType>)[] = [this.root]
    let addToStr = (c: InnerNode<LblType>, e: Leaf<LblType> | InnerNode<LblType> | undefined) => a = a + `\n${this.nodeNameToString(c)} -> ${e ? this.nodeNameToString(e) : "null"}`
    while (toExplore.length > 0) {
      let current = toExplore.shift()!
      if (current instanceof InnerNode<LblType>) {
        addToStr(current, current.left)
        addToStr(current, current.right)
        if (current.left) toExplore.push(current.left)
        if (current.right) toExplore.push(current.right)
      }
    }
    return a;
  }

  abstract newChild(name: LblType): DiscTreeFather<LblType, StateType>;

  clone(): DiscTreeFather<LblType, StateType> {
    let res = this.newChild(this.root.name);
    let map = new Map<TreeElt<LblType>, TreeElt<LblType>>();
    map.set(this.root, res.root)
    let toExplore: TreeElt<LblType>[] = [this.root];
    while (toExplore.length > 0) {
      let current = toExplore.pop()!;
      let matched = map.get(current)
      if (current instanceof InnerNode<LblType>) {
        if (current.left instanceof InnerNode<LblType>) {
          let newN = new InnerNode<LblType>({ name: current.left.name, parent: matched as InnerNode<LblType> });
          (matched as InnerNode<LblType>).left = newN
          map.set(current.left, newN)
          toExplore.push(current.left)
          res.innerNodes.add(newN)
        } else if (current.left instanceof Leaf) {
          res.addLeftChild({ parent: matched as InnerNode<LblType>, name: current.left.name });
        }
        if (current.right instanceof InnerNode<LblType>) {
          let newN = new InnerNode<LblType>({ name: current.right.name, parent: matched as InnerNode<LblType> });
          (matched as InnerNode<LblType>).right = newN
          map.set(current.right, newN)
          toExplore.push(current.right)
          res.innerNodes.add(newN)
        } else if (current.right instanceof Leaf) {
          res.addRightChild({ parent: matched as InnerNode<LblType>, name: current.right.name });
        }
      }
    }
    return res
  }

  toDot(): string {
    let a = `digraph DT {`
    const nodes = new Map([...this.innerNodes].map((e, pos) => [e, pos]))
    const leaves = new Map([...this.leaves].map(([_, e], pos) => [e, pos + nodes.size]))
    let toExplore: (InnerNode<LblType> | Leaf<LblType>)[] = [this.root]
    let addToStr = (c: InnerNode<LblType>, isRight: boolean, e: Leaf<LblType> | InnerNode<LblType> | undefined) => a = a + `\n${nodes.get(c)} -> ${e ? (e instanceof InnerNode<LblType> ? nodes.get(e) : leaves.get(e)) : "point"} [style="${isRight ? "filled" : "dashed"}"]`
    while (toExplore.length > 0) {
      let current = toExplore.shift()!
      if (current instanceof InnerNode<LblType>) {
        addToStr(current, false, current.left)
        addToStr(current, true, current.right)
        if (current.left) toExplore.push(current.left)
        if (current.right) toExplore.push(current.right)
      }
    }
    nodes.forEach((_e, f) => a = a + `\n${nodes.get(f)}[label="${this.nodeNameToString(f)}"]`)
    leaves.forEach((_e, f) => a = a + `\n${leaves.get(f)}[label="${this.nodeNameToString(f)}", shape="rect"]`)
    if (this.root.left === undefined || this.root.right === undefined) {
      a = a + "\npoint[shape=point]";
    }
    a = a + "\n}";
    return a;
  }
}