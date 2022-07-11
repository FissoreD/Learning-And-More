import { Teacher } from "../../teachers/teacher";

class InnerNode {
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
}

class Leaf {
  name: string
  parent: InnerNode
  depth: number
  constructor(p: { name: string, parent: InnerNode }) {
    this.name = p.name;
    this.parent = p.parent;
    this.depth = p.parent.depth + 1;
  }
}

type TreeElt = InnerNode | Leaf

export default class DiscriminationTree {
  private root: InnerNode;
  private leaves: Set<Leaf>;
  private innerNodes: Set<InnerNode>;
  private acceptingLeaves: Set<Leaf>

  constructor(root_name: string) {
    this.root = new InnerNode({ name: root_name })
    this.leaves = new Set()
    this.acceptingLeaves = new Set()
    this.innerNodes = new Set([this.root])
  }

  sift(word: string, teacher: Teacher): Leaf | undefined {
    let currentNode: InnerNode | Leaf | undefined = this.root;
    while (currentNode instanceof InnerNode) {
      currentNode = teacher.member(word + currentNode.name) ? currentNode.right : currentNode.left
    }
    return currentNode
  }

  lowest_common_anchestor(te1: TreeElt, te2: TreeElt) {
    while (te1.depth > te2.depth) te1 = te1.parent!
    while (te1.depth < te2.depth) te2 = te2.parent!
    while (te1 != te2) {
      te1 = te1.parent!
      te2 = te2.parent!
    }
    return te1
  }

  split_leaf(p: { leaf_to_split: Leaf, new_discriminator: string, name_leaf_to_add: string, is_top: boolean }) {
    let parent = p.leaf_to_split.parent;
    let new_inner_node = new InnerNode({ name: p.new_discriminator, parent })
    this.innerNodes.add(new_inner_node)

    // Set new child's parent after split
    if (parent.right === p.leaf_to_split) parent.right = new_inner_node
    else parent.left = new_inner_node

    let new_leaf = new Leaf({ name: p.name_leaf_to_add, parent: new_inner_node })
    if (this.acceptingLeaves.has(p.leaf_to_split)) this.acceptingLeaves.add(new_leaf)

    let old_leaf = p.leaf_to_split

    this.leaves.add(new_leaf)
    if (p.is_top) {
      new_inner_node.right = new_leaf
      new_inner_node.left = old_leaf
    } else {
      new_inner_node.left = new_leaf
      new_inner_node.right = old_leaf
    }

    return new_inner_node;
  }

  is_accepting(parent: InnerNode) {
    while (parent.parent?.parent !== undefined) {
      parent = parent.parent
    }
    if (parent?.parent?.right === parent)
      return true
    return false
  }

  add_right_child(p: { parent: InnerNode, name: string }) {
    let new_leaf = new Leaf(p)
    p.parent.right = new_leaf
    this.leaves.add(new_leaf)

    let parent = p.parent
    if (parent.parent === undefined || this.is_accepting(parent)) this.acceptingLeaves.add(new_leaf)
    return new_leaf
  }

  add_left_child(p: { parent: InnerNode, name: string }) {
    let new_leaf = new Leaf(p)
    p.parent.left = new_leaf
    this.leaves.add(new_leaf)

    if (this.is_accepting(p.parent)) this.acceptingLeaves.add(new_leaf)
    return new_leaf
  }

  get_root() {
    return this.root;
  }

  get_leaves() {
    return this.leaves
  }

  get_accepting_leaves() {
    return this.acceptingLeaves;
  }

  add_root(s: string): Leaf {
    if (this.root.right === undefined)
      return this.add_right_child({ parent: this.root, name: s })
    else
      return this.add_left_child({ parent: this.root, name: s })
  }
}