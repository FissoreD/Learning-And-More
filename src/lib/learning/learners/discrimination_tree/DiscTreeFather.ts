import { toEps } from "../../../tools";
import LearningDataStructure from "../learning_data_structure";

export class InnerNode {
  name: string;
  right: InnerNode | Leaf | undefined;
  left: InnerNode | Leaf | undefined;
  parent: InnerNode | undefined;
  depth = 0;
  constructor(p: {
    name: string,
    top?: InnerNode | Leaf,
    bot?: InnerNode | Leaf,
    parent?: InnerNode
  }) {
    this.name = p.name
    this.right = p.top
    this.left = p.bot
    this.parent = p.parent
    this.depth = p.parent?.depth || 0
  }

  addRightLeaf(l: Leaf) {
    this.right = l
    l.setParent(this, true)
  }

  addLeftLeaf(l: Leaf) {
    this.left = l
    l.setParent(this, false)
  }
}

export class Leaf {
  name: string
  parent: InnerNode
  depth: number
  isAccepting: boolean | undefined;
  constructor(p: { name: string, parent: InnerNode }) {
    this.name = p.name;
    this.parent = p.parent;
    this.depth = p.parent.depth + 1;
  }

  setParent(i: InnerNode, isRight: boolean) {
    this.parent = i;
    this.isAccepting = this.isAcceptingMethod(i, isRight)
  }

  isAcceptingMethod(parent: InnerNode, isRight: boolean): boolean {
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
}

export type TreeElt = InnerNode | Leaf

export default abstract class DiscTreeFather implements LearningDataStructure {
  protected root: InnerNode;
  protected leaves: Map<string, Leaf>;
  protected innerNodes: Set<InnerNode>;

  constructor(rootName: string) {
    this.root = new InnerNode({ name: rootName })
    this.leaves = new Map()
    this.innerNodes = new Set([this.root])
  }

  lowestCommonAnchestor(te1: TreeElt, te2: TreeElt) {
    while (te1.depth > te2.depth) te1 = te1.parent!
    while (te1.depth < te2.depth) te2 = te2.parent!
    while (te1 !== te2) {
      te1 = te1.parent!
      te2 = te2.parent!
    }
    return te1
  }

  splitLeaf(p: { leafName: string, newDiscriminator: string, nameLeafToAdd: string, isTop: boolean }) {
    let leafToSplit = this.leaves.get(p.leafName)!
    let parent = leafToSplit.parent;
    let newInnerNode = new InnerNode({ name: p.newDiscriminator, parent })
    this.innerNodes.add(newInnerNode)

    // Set new child's parent after split
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

  addRightChild(p: { parent: InnerNode, name: string }) {
    let newLeaf = new Leaf(p)
    p.parent.addRightLeaf(newLeaf)
    this.leaves.set(newLeaf.name, newLeaf)
    return newLeaf
  }

  addLeftChild(p: { parent: InnerNode, name: string }) {
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

  addRoot(s: string): Leaf {
    if (this.root.right === undefined)
      return this.addRightChild({ parent: this.root, name: s })
    else
      return this.addLeftChild({ parent: this.root, name: s })
  }

  toString() {
    let a = "";
    let toExplore: (InnerNode | Leaf)[] = [this.root]
    let addToStr = (c: InnerNode, e: Leaf | InnerNode | undefined) => a = a + `\n${toEps(c.name)} -> ${e ? toEps(e.name) : "null"}`
    while (toExplore.length > 0) {
      let current = toExplore.shift()!
      if (current instanceof InnerNode) {
        addToStr(current, current.left)
        addToStr(current, current.right)
        if (current.left) toExplore.push(current.left)
        if (current.right) toExplore.push(current.right)
      }
    }
    return a;
  }

  abstract newChild(name: string): DiscTreeFather;

  clone(): DiscTreeFather {
    let res = this.newChild(this.root.name);
    let map = new Map<TreeElt, TreeElt>();
    map.set(this.root, res.root)
    let toExplore: TreeElt[] = [this.root];
    while (toExplore.length > 0) {
      let current = toExplore.pop()!;
      let matched = map.get(current)
      if (current instanceof InnerNode) {
        if (current.left instanceof InnerNode) {
          let newN = new InnerNode({ name: current.left.name, parent: matched as InnerNode });
          (matched as InnerNode).left = newN
          map.set(current.left, newN)
          toExplore.push(current.left)
          res.innerNodes.add(newN)
        } else if (current.left instanceof Leaf) {
          res.addLeftChild({ parent: matched as InnerNode, name: current.left.name });
        }
        if (current.right instanceof InnerNode) {
          let newN = new InnerNode({ name: current.right.name, parent: matched as InnerNode });
          (matched as InnerNode).right = newN
          map.set(current.right, newN)
          toExplore.push(current.right)
          res.innerNodes.add(newN)
        } else if (current.right instanceof Leaf) {
          res.addRightChild({ parent: matched as InnerNode, name: current.right.name });
        }
      }
    }
    return res
  }

  toDot(): string {
    let a = `digraph DT {`
    const nodes = new Map([...this.innerNodes].map((e, pos) => [e, pos]))
    const leaves = new Map([...this.leaves].map(([_, e], pos) => [e, pos + nodes.size]))
    let toExplore: (InnerNode | Leaf)[] = [this.root]
    let addToStr = (c: InnerNode, e: Leaf | InnerNode | undefined) => a = a + `\n${nodes.get(c)} -> ${e ? (e instanceof InnerNode ? nodes.get(e) : leaves.get(e)) : "point"}`
    while (toExplore.length > 0) {
      let current = toExplore.shift()!
      if (current instanceof InnerNode) {
        addToStr(current, current.left)
        addToStr(current, current.right)
        if (current.left) toExplore.push(current.left)
        if (current.right) toExplore.push(current.right)
      }
    }
    nodes.forEach((_e, f) => a = a + `\n${nodes.get(f)}[label = "${toEps(f.name)}"]`)
    leaves.forEach((_e, f) => a = a + `\n${leaves.get(f)}[label = "${toEps(f.name)}"]`)
    if (this.root.left === undefined || this.root.right === undefined)
      a = a + "\npoint[shape=point]";
    a = a + "\n}";
    return a;
  }
}