import { to_eps } from "../../../tools";
import Teacher from "../../teachers/teacher";
import LearningDataStructure from "../learning_data_structure";

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

  add_right_leaf(l: Leaf) {
    this.right = l
    l.set_parent(this, true)
  }

  add_left_leaf(l: Leaf) {
    this.left = l
    l.set_parent(this, false)
  }
}

class Leaf {
  name: string
  parent: InnerNode
  depth: number
  is_accepting: boolean | undefined;
  constructor(p: { name: string, parent: InnerNode }) {
    this.name = p.name;
    this.parent = p.parent;
    this.depth = p.parent.depth + 1;
  }

  set_parent(i: InnerNode, is_right: boolean) {
    this.parent = i;
    this.is_accepting = this.is_accepting_m(i, is_right)
  }

  is_accepting_m(parent: InnerNode, is_right: boolean): boolean {
    if (this.is_accepting !== undefined) return this.is_accepting
    if (is_right && parent.parent === undefined)
      return true
    while (parent.parent?.parent !== undefined) {
      parent = parent.parent
    }
    if (parent?.parent?.right === parent)
      return true
    return false
  }
}

type TreeElt = InnerNode | Leaf

export default class DiscriminationTree implements LearningDataStructure {
  private root: InnerNode;
  private leaves: Map<string, Leaf>;
  private innerNodes: Set<InnerNode>;

  constructor(root_name: string) {
    this.root = new InnerNode({ name: root_name })
    this.leaves = new Map()
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
    while (te1 !== te2) {
      te1 = te1.parent!
      te2 = te2.parent!
    }
    return te1
  }

  split_leaf(p: { leaf_name: string, new_discriminator: string, name_leaf_to_add: string, is_top: boolean }) {
    let leaf_to_split = this.leaves.get(p.leaf_name)!
    let parent = leaf_to_split.parent;
    let new_inner_node = new InnerNode({ name: p.new_discriminator, parent })
    this.innerNodes.add(new_inner_node)

    // Set new child's parent after split
    if (parent.right === leaf_to_split) parent.right = new_inner_node
    else parent.left = new_inner_node

    let new_leaf = new Leaf({ name: p.name_leaf_to_add, parent: new_inner_node })

    let old_leaf = leaf_to_split

    this.leaves.set(new_leaf.name, new_leaf)
    if (p.is_top) {
      new_inner_node.add_right_leaf(new_leaf)
      new_inner_node.add_left_leaf(old_leaf)
    } else {
      new_inner_node.add_left_leaf(new_leaf)
      new_inner_node.add_right_leaf(old_leaf)
    }

    return new_inner_node;
  }

  add_right_child(p: { parent: InnerNode, name: string }) {
    let new_leaf = new Leaf(p)
    p.parent.add_right_leaf(new_leaf)
    this.leaves.set(new_leaf.name, new_leaf)
    return new_leaf
  }

  add_left_child(p: { parent: InnerNode, name: string }) {
    let new_leaf = new Leaf(p)
    p.parent.add_left_leaf(new_leaf)
    this.leaves.set(new_leaf.name, new_leaf)
    return new_leaf
  }

  get_root() {
    return this.root;
  }

  get_leaves() {
    return this.leaves
  }

  add_root(s: string): Leaf {
    if (this.root.right === undefined)
      return this.add_right_child({ parent: this.root, name: s })
    else
      return this.add_left_child({ parent: this.root, name: s })
  }

  toString() {
    let a = "";
    let to_explore: (InnerNode | Leaf)[] = [this.root]
    let add_to_str = (c: InnerNode, e: Leaf | InnerNode | undefined) => a = a + `\n${to_eps(c.name)} -> ${e ? to_eps(e.name) : "null"}`
    while (to_explore.length > 0) {
      let current = to_explore.shift()!
      if (current instanceof InnerNode) {
        add_to_str(current, current.left)
        add_to_str(current, current.right)
        if (current.left) to_explore.push(current.left)
        if (current.right) to_explore.push(current.right)
      }
    }
    return a;
  }

  clone(): DiscriminationTree {
    let res = new DiscriminationTree(this.root.name)
    let map = new Map<TreeElt, TreeElt>();
    map.set(this.root, res.root)
    let to_explore: TreeElt[] = [this.root];
    while (to_explore.length > 0) {
      let current = to_explore.pop()!;
      let matched = map.get(current)
      if (current instanceof InnerNode) {
        if (current.left instanceof InnerNode) {
          let newN = new InnerNode({ name: current.left.name, parent: matched as InnerNode });
          (matched as InnerNode).left = newN
          map.set(current.left, newN)
          to_explore.push(current.left)
          res.innerNodes.add(newN)
        } else if (current.left instanceof Leaf) {
          res.add_left_child({ parent: matched as InnerNode, name: current.left.name });
        }
        if (current.right instanceof InnerNode) {
          let newN = new InnerNode({ name: current.right.name, parent: matched as InnerNode });
          (matched as InnerNode).right = newN
          map.set(current.right, newN)
          to_explore.push(current.right)
          res.innerNodes.add(newN)
        } else if (current.right instanceof Leaf) {
          res.add_right_child({ parent: matched as InnerNode, name: current.right.name });
        }
      }
    }
    console.log(this.toString());
    console.log(res.toString());
    console.log("-".repeat(30));


    return res
  }

  toDot(): string {
    let a = `digraph DT {`
    const nodes = new Map([...this.innerNodes].map((e, pos) => [e, pos]))
    const leaves = new Map([...this.leaves].map(([_, e], pos) => [e, pos + nodes.size]))
    let to_explore: (InnerNode | Leaf)[] = [this.root]
    let add_to_str = (c: InnerNode, e: Leaf | InnerNode | undefined) => a = a + `\n${nodes.get(c)} -> ${e ? (e instanceof InnerNode ? nodes.get(e) : leaves.get(e)) : "point"}`
    while (to_explore.length > 0) {
      let current = to_explore.shift()!
      if (current instanceof InnerNode) {
        add_to_str(current, current.left)
        add_to_str(current, current.right)
        if (current.left) to_explore.push(current.left)
        if (current.right) to_explore.push(current.right)
      }
    }
    nodes.forEach((_e, f) => a = a + `\n${nodes.get(f)}[label = "${to_eps(f.name)}"]`)
    leaves.forEach((_e, f) => a = a + `\n${leaves.get(f)}[label = "${to_eps(f.name)}"]`)
    if (this.root.left === undefined || this.root.right === undefined)
      a = a + "\npoint[shape=point]";
    a = a + "\n}";
    return a;
  }
}