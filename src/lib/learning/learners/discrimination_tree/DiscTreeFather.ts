import { edgeDotStyle } from "../../../tools";
import Teacher from "../../teachers/Teacher";
import DataStructure from "../DataStructure.interface";
import { InnerNode } from "./tree_elt/InnerNode";
import { Leaf } from "./tree_elt/Leaf";
import { TreeElt } from "./tree_elt/TreeElt";

export default abstract class DiscTreeFather<LblType> implements DataStructure {
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

  abstract newChild(name: LblType): DiscTreeFather<LblType>;

  clone(): DiscTreeFather<LblType> {
    let res = this.newChild(this.root.name);
    let map = new Map<TreeElt<LblType>, TreeElt<LblType>>();
    map.set(this.root, res.root)
    let toExplore: TreeElt<LblType>[] = [this.root];
    while (toExplore.length > 0) {
      let current = toExplore.pop()!;
      let matched = map.get(current) as InnerNode<LblType>
      if (current instanceof InnerNode<LblType>) {
        if (current.left instanceof InnerNode<LblType>) {
          let newN = new InnerNode<LblType>({ name: current.left.name, parent: matched });
          matched.left = newN
          map.set(current.left, newN)
          toExplore.push(current.left)
          res.innerNodes.add(newN)
        } else if (current.left instanceof Leaf) {
          res.addLeftChild({ parent: matched, name: current.left.name });
        }
        if (current.right instanceof InnerNode<LblType>) {
          let newN = new InnerNode<LblType>({ name: current.right.name, parent: matched });
          matched.right = newN
          map.set(current.right, newN)
          toExplore.push(current.right)
          res.innerNodes.add(newN)
        } else if (current.right instanceof Leaf) {
          res.addRightChild({ parent: matched, name: current.right.name });
        }
      }
    }
    return res
  }

  toDot(): string {
    let a = `digraph DT {`

    // a = a.concat(nodeDotRounded)
    a = a.concat(edgeDotStyle)

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