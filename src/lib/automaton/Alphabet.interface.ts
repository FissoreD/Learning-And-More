export default interface Alphabet {
  union(...alphabet: Alphabet[]): Alphabet;
  makeSet(): void;
}