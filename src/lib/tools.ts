export type myFunction<S, T> = { (data: S): T; };

export function sameVector(v1: any[], v2: any[]): boolean {
  return v1.length === v2.length && v1.every((elt, pos) => elt === v2[pos]);
}

/**
 * creates all prefixes from the str passed in input :
 * example for hello : ['', 'h', 'he', 'hel', 'hell', 'hello']
 */
export const generatePrefixList = (str: string) =>
  Array(str.length + 1).fill(0).map((_, i) => str.substring(0, i)).reverse();

/**
 * Creates all suffix from the str passed in input :   
 * example for hello : ['hello', 'ello', 'llo', 'lo', 'o', '']
 */
export const generateSuffixList = (str: string) =>
  Array(str.length + 1).fill("").map((_, i) => str.substring(i, str.length + 1));

export const countStrOccurrences = (str: string, obj: string) =>
  Array.from(str).filter(f => f === obj).length

export function boolToString(bool: boolean): string {
  return bool ? "1" : "0";
}

export function allStringFromAlphabet(params: { alphabet: string[] | string, maxLength: number }) {
  let res: string[] = [""]
  let alphabet = Array.from(params.alphabet).sort()
  let level = [""]
  while (res[res.length - 1].length < params.maxLength) {
    let res1: string[] = []
    level.forEach(e => alphabet.forEach(a => {
      res.push(e + a)
      res1.push(e + a)
    }))
    level = res1
  }
  return res;
}

export let myLog = ({ a, toLog = false }: { a: any[], toLog?: boolean }) => {
  if (true || toLog) console.log(...a);
}

export const todo = () => {
  throw new Error("Function not implemented.");
}

export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
};

export const toEps = (s: string) => s === "" ? "ε" : s