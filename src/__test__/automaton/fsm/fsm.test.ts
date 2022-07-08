import { debug } from "console";
import { Automaton } from "../../../automaton/fsm/DFA_NFA";

test("Automaton minimization", () => {
  let a = Automaton.strToAutomaton(`
    [Q1]
    a,[Q1]->[Q2]
    a,[Q2]->[Q3]
    a,[Q3]->[Q3]
    [Q2]
    [Q3]`);
  expect(a.state_number()).toBe(3);
  let minimized = a.minimize()
  expect(minimized.state_number()).toBe(2);
  expect(minimized.transition_number()).toBe(2);
})

test("Automaton Word membership", () => {
  let a = Automaton.strToAutomaton(`
    [Q1]
    a,[Q1]->[Q2]
    b,[Q1]->[Q2]
    a,[Q2]->[Q2]
    [Q2]`);
  expect(a.accept_word('a')).toBe(true);
  expect(a.accept_word('b')).toBe(true);
  expect(a.accept_word('c')).toBe(false);
  expect(a.accept_word('')).toBe(false);
  expect(a.accept_word('aaaa')).toBe(true);
  expect(a.accept_word('aaab')).toBe(false);
})

test("Automaton Parse and to String methodes", () => {
  let aut_str = `
    [Q1]
    a,[Q1]->[Q2]
    a,[Q2]->[Q2]
    [Q2]`
  let a = Automaton.strToAutomaton(aut_str);
  expect(a.toString()).toBe(aut_str);
})

test("Automaton Determinize", () => {
  let aut_str = `[Q0]
    [Q1]
    [Q2]
    a,[Q0]->[Q1]
    a,[Q0]->[Q2]
    [Q1]
    [Q2]`
  let a = Automaton.strToAutomaton(aut_str)
  expect(a.state_number()).toBe(3);
  expect(a.is_deterministic()).toBe(false)

  let a_det = a.determinize()
  expect(a_det.is_deterministic()).toBe(true)
  expect(a_det.state_number()).toBe(3);

  let aut_already_determinist = `[0]
    a,[0]->[1]
    b,[0]->[0]
    a,[1]->[0]
    b,[1]->[0]
    [1]`
  a = Automaton.strToAutomaton(aut_already_determinist);
  debug(a.toString())
  expect(a.determinize().same_language(a));
})

test("Automaton Complement & Union & Intersection & Sym. Diff", () => {
  let aut_str = `[kk]
    a,[kk]->[ss]
    a,[kk]->[kkk]
    a,[ss]->[kk]
    b,[kkk]->[zz]
    [ss]
    [kkk]`
  let a1 = Automaton.strToAutomaton(aut_str)
  let a1_compl = a1.complement();
  let words = new Array(10).fill(0).map((_, pos) => "a".repeat(pos));
  words.push("abbab");
  words.forEach(w => expect(a1.accept_word(w)).toBe(!a1_compl.accept_word(w))); // w in a <=> w notin ~a

  expect(a1.union(a1_compl).is_full()).toBe(true) // A union ~A <=> T
  expect(a1.intersection(a1_compl).is_empty()).toBe(true) // A inter ~A = bottom
  expect(a1.symmetric_difference(a1).is_empty()).toBe(true) // A △ A = bottom
  expect(a1.symmetric_difference(a1_compl).is_full()).toBe(true) // A △ ~A = T
  expect(a1.difference(a1_compl).same_language(a1)).toBe(true)
})