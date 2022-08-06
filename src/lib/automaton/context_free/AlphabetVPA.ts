import Clonable from "../../Clonable.interface"
import Alphabet from "../Alphabet.interface"

export type ALPHABET_TYPE = "INT" | "RET" | "CALL"
export const ALPH_TYPE_LIST: ALPHABET_TYPE[] = ["INT", "RET", "CALL"]

export default class AlphabetVPA implements Clonable, Alphabet {
  INT: string[]
  CALL: string[]
  RET: string[]

  constructor(p?: { INT?: string[], CALL?: string[], RET?: string[] }) {
    this.INT = p?.INT ? [...p.INT] : []
    this.CALL = p?.CALL ? [...p.CALL] : []
    this.RET = p?.RET ? [...p.RET] : []
    this.makeSet()
  }

  /**
   * @returns a fresh copy of the Alphabet
   */
  clone() {
    return new AlphabetVPA({ INT: this.INT, CALL: this.CALL, RET: this.RET })
  }

  /**
   * @returns a fresh Alphabet from the union of an ellipsis of AlphabetVPA
   * @throws Error if INT, RET & CALL are not in disjoint union
   */
  union(...alphabet: AlphabetVPA[]) {
    let res = alphabet.reduce((prev, curr) => {
      prev.INT = prev.INT.concat(curr.INT)
      prev.CALL = prev.CALL.concat(curr.CALL)
      prev.RET = prev.RET.concat(curr.RET)
      return prev
    }, this.clone())
    res.isValidAlphabet()
    return res
  }

  /** 
   * inplace method to remove duplicata from INT, CALL and RET 
   */
  makeSet() {
    this.INT = [...new Set(this.INT)]
    this.RET = [...new Set(this.RET)]
    this.CALL = [...new Set(this.CALL)]
  }

  toString() {
    return JSON.stringify({ INT: this.INT, CALL: this.CALL, RET: this.RET })
  }

  /**
   * Remove duplicata in alphabet and test for validity   
   * e.g.: an alphabet is not valid if at least one symbol is owned by to set of INT, RET, CALL
   */
  isValidAlphabet() {
    this.makeSet()
    let a = new Set([...this.CALL, ...this.INT, ...this.RET])
    if (a.size !== this.CALL.length + this.INT.length + this.RET.length)
      throw new Error("This alphabet is not valid since INT, CALL and RET are not union" + this.toString())
  }

  /** 
   * @returns a list of all alphabet symbols
   */
  flatAlphabet() {
    return ALPH_TYPE_LIST.map(e => this[e]).flat()
  }
}
