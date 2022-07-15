import Automaton from "../../../lib/automaton/fsm/DFA_NFA";
import { default as regexToAutomaton } from "../../../lib/automaton/regex_parser";

test("Regex parser", () => {
  let aut = regexToAutomaton("(a+b)*a+$")
  expect(aut.accept_word("a")).toBeTruthy()
  expect(aut.accept_word("")).toBeTruthy()
  expect(aut.accept_word("ba")).toBeTruthy()
  expect(aut.accept_word("bbba")).toBeTruthy()
})

test("Regex intersection", () => {
  let a1 = Automaton.regex_to_automaton("a+b")
  let a2 = Automaton.regex_to_automaton("(a+b)*c")

  let inter = a1.intersection(a2).minimize()
  expect(inter.is_empty()).toBeTruthy()
})