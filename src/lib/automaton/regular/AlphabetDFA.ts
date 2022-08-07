import Alphabet from "../Alphabet.interface";

export default class AlphabetDFA implements Alphabet {
  symbols: string[];

  constructor(...symbols: string[]) {
    this.symbols = [...symbols]
    this.makeSet()
  }

  union(...alphabets: AlphabetDFA[]): AlphabetDFA {
    return new AlphabetDFA(...alphabets.map(e => e.symbols).flat().concat(this.symbols))
  }

  makeSet(): void {
    this.symbols = [...new Set(this.symbols)]
  }

  clone() {
    return new AlphabetDFA(...this.symbols)
  }
}