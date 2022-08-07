export type myFunction<S, T> = { (data: S): T; };

export const edgeDotStyle = `edge [arrowhead="vee" penwidth="1"]\n`
export const nodeDotCircleFixed = `node [style=rounded, shape=circle, fixedsize=true]\n`
export const nodeDotRounded = `node [style=rounded]\n`

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

export function boolToString(bool: boolean): string {
  return bool ? "1" : "0";
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