import DFA_NFA from "../DFA_NFA";

test("Automaton minimization", () => {
  let a = DFA_NFA.strToAutomaton(`
    [Q1]
    a,[Q1]->[Q2]
    a,[Q2]->[Q3]
    a,[Q3]->[Q3]
    [Q2]
    [Q3]`);
  expect(a.getStateNumber()).toBe(3);
  let minimized = a.minimize()
  expect(minimized.getStateNumber()).toBe(2);
  expect(minimized.getTransitionNumber()).toBe(2);
})

test("Automaton Word membership", () => {
  let a = DFA_NFA.strToAutomaton(`
    [Q1]
    a,[Q1]->[Q2]
    b,[Q1]->[Q2]
    a,[Q2]->[Q2]
    [Q2]`);
  expect(a.acceptWord('a')).toBe(true);
  expect(a.acceptWord('b')).toBe(true);
  expect(a.acceptWord('c')).toBe(false);
  expect(a.acceptWord('')).toBe(false);
  expect(a.acceptWord('aaaa')).toBe(true);
  expect(a.acceptWord('aaab')).toBe(false);
})

test("Automaton Parse and to String methodes", () => {
  let autStr = `
    [Q1]
    a,[Q1]->[Q2]
    a,[Q2]->[Q2]
    [Q2]`
  let a = DFA_NFA.strToAutomaton(autStr);
  let b = DFA_NFA.strToAutomaton(a.toString())
  expect(b.sameLanguage(a)).toBe(true);
})

test("Automaton Determinize", () => {
  let autStr = `[Q0]
    [Q1]
    [Q2]
    a,[Q0]->[Q1]
    a,[Q0]->[Q2]
    [Q1]
    [Q2]`
  let a = DFA_NFA.strToAutomaton(autStr)
  expect(a.getStateNumber()).toBe(3);
  expect(a.isDeterministic()).toBe(false)

  let determinized = a.determinize()
  expect(determinized.isDeterministic()).toBe(true)
  expect(determinized.getStateNumber()).toBe(3);

  let autAlreadyDeterminist = `[0]
    a,[0]->[1]
    b,[0]->[0]
    a,[1]->[0]
    b,[1]->[0]
    [1]`
  a = DFA_NFA.strToAutomaton(autAlreadyDeterminist);
  expect(a.determinize().sameLanguage(a));
})

test("Automaton Complement & Union & Intersection & Sym. Diff", () => {
  let autStr = `[0]
    a,[0]->[1]
    a,[0]->[2]
    a,[1]->[0]
    [1]
    [2]`
  let a1 = DFA_NFA.strToAutomaton(autStr)

  let a1_compl = a1.complement();

  let words = new Array(10).fill(0).map((_, pos) => "a".repeat(pos));

  words.forEach(w => expect(a1.acceptWord(w)).toBe(!a1_compl.acceptWord(w))); // w in a <=> w notin ~a

  expect(a1.union(a1_compl).isFull()).toBe(true) // A union ~A <=> T

  expect(a1.sameLanguage(a1)).toBe(true)

  expect(a1.difference(a1_compl).sameLanguage(a1)).toBe(true)
  expect(a1.intersection(a1_compl).isEmpty()).toBe(true) // A inter ~A = bottom
  expect(a1.symmetricDifference(a1).isEmpty()).toBe(true) // A △ A = bottom
  expect(a1.symmetricDifference(a1_compl).isFull()).toBe(true) // A △ ~A = T
})

test("Automaton Difference", () => {
  let a1 = DFA_NFA.strToAutomaton(`[0]
  a,[0]->[0]
  b,[0]->[2]
  [0]`) // L(a1) = a*
  let a2 = DFA_NFA.strToAutomaton(`[3]
  a,[3]->[4]
  b,[3]->[5]
  [4]`) // L(a2) = a
  let diff = DFA_NFA.strToAutomaton(`[6]
  a,[6]->[7]
  a,[7]->[8]
  a,[8]->[8]
  b,[6]->[9]
  [6]
  [8]`)

  let a1_union_a2 = a1.union(a2).minimize()
  let a2_union_a1 = a2.union(a1).minimize()

  expect(a1_union_a2.sameLanguage(a2_union_a1)).toBe(true)
  expect(a2_union_a1.sameLanguage(a1_union_a2)).toBe(true)

  let a1_inter_a2 = a1.intersection(a2)
  expect(a1_inter_a2.sameLanguage(a2.intersection(a1))).toBe(true)

  let a2_comp = a2.complement()
  expect(a1.acceptWord('aa')).toBeTruthy();
  expect(a2_comp.acceptWord('aa')).toBeTruthy();
  expect(a1.acceptWord('a')).toBeTruthy();
  expect(a2_comp.acceptWord('a')).toBeFalsy();
  expect(a2_comp.acceptWord('a')).toBeFalsy();
  expect(a1.difference(a2).sameLanguage(diff)).toBe(true)
})

describe("DFA counter-example", () => {
  test("a*b", () => {
    let aut = DFA_NFA.regexToAutomaton("a*b")
    expect(aut.findWordAccepted(0)).toBe("b")
    expect(aut.findWordAccepted(1)).toBe("b")
    expect(aut.findWordAccepted(2)).toBe("ab")
    expect(aut.findWordAccepted(3)).toBe("aab")
    expect(aut.findWordAccepted(4)).toBe("aaab")
  })

  test("ab", () => {
    let aut = DFA_NFA.regexToAutomaton("ab")
    expect(aut.findWordAccepted(0)).toBe("ab")
    expect(aut.findWordAccepted(1)).toBe("ab")
    expect(aut.findWordAccepted(2)).toBe("ab")
    expect(aut.findWordAccepted(3)).toBe("ab")
    expect(aut.findWordAccepted(4)).toBe("ab")
  })
})