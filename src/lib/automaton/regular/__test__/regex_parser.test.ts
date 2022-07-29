import DFA_NFA from "../DFA_NFA"
import regexToAutomaton from "../parser/RegexParser"

test("Regex parser", () => {
  let aut = regexToAutomaton("(a+b)*a+$")
  expect(aut.acceptWord("a")).toBeTruthy()
  expect(aut.acceptWord("")).toBeTruthy()
  expect(aut.acceptWord("ba")).toBeTruthy()
  expect(aut.acceptWord("bbba")).toBeTruthy()
})

test("Regex intersection", () => {
  let a1 = DFA_NFA.regex2automaton("a+b")
  let a2 = DFA_NFA.regex2automaton("(a+b)*c")

  let inter = a1.intersection(a2).minimize()
  expect(inter.isEmpty()).toBeTruthy()
})