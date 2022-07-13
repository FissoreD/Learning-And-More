import { default as regexToAutomaton } from "../../../lib/automaton/regex_parser";

test("Regex parser", () => {
  let aut = regexToAutomaton("(a+b)*a+$")
  expect(aut.accept_word("a")).toBeTruthy()
  expect(aut.accept_word("")).toBeTruthy()
  expect(aut.accept_word("ba")).toBeTruthy()
  expect(aut.accept_word("bbba")).toBeTruthy()
})