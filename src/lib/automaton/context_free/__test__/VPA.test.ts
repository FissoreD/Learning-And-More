import { createVPA1, createVPA2, createVPA3, createVPAxml1 } from "../../../__test__/VPAforTest";
import AlphabetVPA from "../AlphabetVPA";
import StateVPA from "../StateVPA";
import VPA from "../VPA";

test("State VPA creation", () => {
  let alphabet = new AlphabetVPA({ CALL: ["A"], RET: ["B", "C"], INT: ["I"] })
  let stackAlphabet = ["0", "1"]
  let state1 = new StateVPA({ name: "1", alphabet, stackAlphabet })
  let state2 = new StateVPA({ name: "2", alphabet, stackAlphabet })
  state1.addTransition({ symbol: "I", successor: state1 })
  state2.addTransition({ symbol: "I", successor: state1 })
  state2.addTransition({ symbol: "B", topStack: "0", successor: state1 })
  state2.addTransition({ symbol: "A", topStack: "0", successor: state1 })
  state2.addTransition({ symbol: "A", topStack: "0", successor: state1 })

  /* TESTING INT */
  expect(state1.getSuccessor({ symbol: "I" })[0]).toBe(state1)
  expect(state2.getSuccessor({ symbol: "I" })[0]).toBe(state1)
  expect(state1.getPredecessor({ symbol: "I" }).includes(state1)).toBeTruthy()
  expect(state1.getPredecessor({ symbol: "I" }).includes(state2)).toBeTruthy()

  /* TESTING RET */
  expect(state2.getSuccessor({ symbol: "B", topStack: "0" })[0]).toBe(state1)
  expect(state1.getPredecessor({ symbol: "B", topStack: "0" })[0]).toBe(state2)
})

test("Word membership VPA", () => {
  let vpa = createVPA1()
  expect(vpa.acceptWord("aaaibiiii")).toBeFalsy()
  expect(vpa.acceptWord("aaaibiiiibb")).toBeTruthy()
  expect(vpa.acceptWord("aaaibiiiib")).toBeFalsy();
  expect(vpa.acceptWord("aaaibiiiibbb")).toBeFalsy();
  expect(vpa.acceptWord("i")).toBeTruthy()
  expect(vpa.acceptWord("aib")).toBeTruthy()
})

test("Deterministic VPA", () => {
  let vpa = createVPA1()
  expect(vpa.isDeterministic()).toBeTruthy();
})

test("Union VPA", () => {
  let vpa1 = createVPA1()
  let vpa2 = createVPA2()
  expect(vpa1.union(vpa2).sameLanguage(vpa2.union(vpa1))).toBeTruthy()
  expect(vpa1.union(vpa1.complement()).isFull()).toBeTruthy()
})

test("Intersection VPA", () => {
  let vpa1 = createVPA1()
  let vpa2 = createVPA2()
  let intersection = vpa1.intersection(vpa2)
  expect(vpa1.union(intersection).sameLanguage(vpa1)).toBeTruthy()
  expect(vpa2.union(intersection).sameLanguage(vpa2)).toBeTruthy()
  expect(vpa1.intersection(vpa1.complement()).isEmpty()).toBeTruthy()
})

test("Minimize VPA", () => {
  let vpa1 = createVPA1()
  let vpa2 = createVPA2()
  let functions = [
    VPA.prototype.intersection,
    VPA.prototype.union,
    VPA.prototype.difference,
    VPA.prototype.symmetricDifference,
  ]
  let aut: VPA[];
  functions.forEach(e => {
    aut = [e.apply(vpa1, [vpa2]), e.apply(vpa2, [vpa1]), e.apply(vpa2, [vpa2])]
    aut.forEach(aut => expect(aut.sameLanguage(aut.minimize())).toBeTruthy())
  })
})

describe("VPA counter-example", () => {
  test("vpa3", () => {
    let aut = createVPA3()
    /* Here counter-example are fixed */
    expect(aut.findWordAccepted(0)).toBe("i")
    expect(aut.findWordAccepted(1)).toBe("i")
    expect(aut.findWordAccepted(2)).toBe("aib")
    expect(aut.findWordAccepted(3)).toBe("aib")
    expect(aut.findWordAccepted(8)).toBe("aaaaibbbb")
  })

  test("vpa1", () => {
    let aut = createVPA1()
    /* Here counter-examples are not predictable: e.g. for i = 4, we can have AIIB, ABII, AABB... */
    for (let i = 0; i < 5; i++) {
      expect(aut.findWordAccepted(i)?.length).toBeGreaterThanOrEqual(i)
    }
  })

  test("vpaXML1", () => {
    let aut = createVPAxml1()
    expect(aut.isEmpty()).toBeFalsy();
  })
})

test("vpa2 is empty", () => {
  let vpa2 = createVPA2()
  expect(vpa2.isEmpty()).toBeFalsy();
})