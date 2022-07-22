
export type ALPHABET_TYPE = "INT" | "RET" | "CALL"
export const ALPH_TYPE_LIST: ALPHABET_TYPE[] = ["INT", "RET", "CALL"]

export default class AlphabetVPA {
  INT: string[]
  CALL: string[]
  RET: string[]

  constructor(p?: { INT: string[], CALL: string[], RET: string[] }) {
    this.INT = p ? [...p.INT] : []
    this.CALL = p ? [...p.CALL] : []
    this.RET = p ? [...p.RET] : []
  }

  /**
   * @returns a fresh copy of the Alphabet
   */
  clone() {
    return new AlphabetVPA({ INT: this.INT, CALL: this.CALL, RET: this.RET })
  }

  /**
   * @returns a fresh Alphabet from the union of two of them
   * @throws Error if INT, RET & CALL are not in disjoint union
   */
  union(...alphabet: AlphabetVPA[]) {
    let res = alphabet.reduce((prev, curr) => {
      prev.INT = prev.INT.concat(curr.INT)
      prev.CALL = prev.CALL.concat(curr.CALL)
      prev.RET = prev.RET.concat(curr.RET)
      return prev
    }, this.clone())
    // Remove Duplicata
    // Check if it is a disjoint union of three sets
    res.makeSet()
    res.isValidAlphabet()
    return res
  }

  difference(alphabet: AlphabetVPA): AlphabetVPA {
    let res = alphabet.clone()
    res.INT = res.INT.filter(e => !alphabet.INT.includes(e))
    res.CALL = res.CALL.filter(e => !alphabet.CALL.includes(e))
    res.RET = res.RET.filter(e => !alphabet.RET.includes(e))
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

  /** 
   * @returns a fresh alphabet from the intersection of all the alphabets passed in parameter 
   */
  intersection(...alphabet: AlphabetVPA[]): AlphabetVPA {
    let res = alphabet.reduce((prev, curr) => {
      prev.INT = prev.INT.filter(e => curr.INT.includes(e))
      prev.RET = prev.RET.filter(e => curr.RET.includes(e))
      prev.CALL = prev.CALL.filter(e => curr.CALL.includes(e))
      return prev
    }, this.clone())
    return res
  }

  toString() {
    return JSON.stringify({ INT: this.INT, CALL: this.CALL, RET: this.RET })
  }

  isValidAlphabet() {
    let a = new Set([...this.CALL, ...this.INT, ...this.RET])
    if (a.size !== this.CALL.length + this.INT.length + this.RET.length)
      throw new Error("This alphabet is not valid since INT, CALL and RET are not union" + this.toString())
  }
}
