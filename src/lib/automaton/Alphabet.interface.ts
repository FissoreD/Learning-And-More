import Clonable from "../Clonable.interface";

export default interface Alphabet extends Clonable<Alphabet> {
  union(...alphabet: Alphabet[]): Alphabet;
  makeSet(): void;
}