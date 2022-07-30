import AlphabetDFA from "../../../automaton/regular/AlphabetDFA";
import StateDFA from "../../../automaton/regular/StateDFA";
import { boolToString, generatePrefixList, generateSuffixList } from "../../../tools";
import { TeacherAutomaton } from "../../teachers/TeacherDFA";
import LearnerFather from "../LearnerFather";
import ObservationTable from "./ObservationTable";

export default abstract class Learner_OT_Father extends LearnerFather<ObservationTable, StateDFA> {
  closednessCounter: number;
  consistenceCounter: number;
  counterExample: string | undefined = "";
  alphabet: AlphabetDFA;

  constructor(teacher: TeacherAutomaton) {
    super(teacher, new ObservationTable(teacher.alphabet.clone()))
    this.alphabet = teacher.alphabet
    this.closednessCounter = 0;
    this.consistenceCounter = 0;
    this.addRow("")
    this.dataStructure.SA.forEach(elt => this.addRow(elt));
  }

  updateObservationTable(key: string, value: string) {
    let oldValue = this.dataStructure.assoc[key];
    if (oldValue !== undefined) value = oldValue + value
    this.dataStructure.assoc[key] = value;
  }

  /**
   * 1. Takes s in {@link S} and e in {@link E} which creating a word 
   * 2. Asks to the {@link teacher} if word is accepted  
   * 3. Updates {@link dataStructure} wrt the answer  
   * No modification is performed in {@link S}, {@link E} or {@link SA} sets
   */
  makeMember(pref: string, suff: string) {
    let word = pref + suff;
    let answer: string;
    // If we know already the answer, we do not query the teacher
    for (let i = 0; i < word.length + 1; i++) {
      let pref1 = word.substring(0, i);
      let suff1 = word.substring(i);
      if (pref1 === pref) continue;
      if (this.dataStructure.E.includes(suff1)) {
        if ((this.dataStructure.S.includes(pref1) || this.dataStructure.SA.includes(pref1)) && this.dataStructure.assoc[pref1]) {
          answer = this.dataStructure.assoc[pref1].charAt(this.dataStructure.E.indexOf(suff1));
          this.updateObservationTable(pref, answer)
          if (answer === undefined) throw new Error('Parameter is not a number!');
          return;
        }
      }
    }
    answer = boolToString(this.teacher.member(word));
    this.updateObservationTable(pref, answer)
    this.memberNumber++;
  }

  /**
   * For all prefix p of {@link newElt} if p is not in {@link S} :
   * remove p from {@link SA} and add it to {@link S}
   * @param newElt the {@link newElt} to add in {@link S}
   * @returns the list of added elt in SA or S
   */
  addEltInS(newElt: string, isAfterMember = false): void {
    let addedList: string[] = [];
    let prefixList = generatePrefixList(newElt);
    for (const prefix of prefixList) {
      if (this.dataStructure.S.includes(prefix)) return;
      if (this.dataStructure.SA.includes(prefix)) {
        this.moveFrom_SA_to_S(prefix);
        for (const a of this.alphabet.symbols) {
          const newWord = prefix + a;
          if (!this.dataStructure.SA.includes(newWord) && !this.dataStructure.S.includes(newWord)) {
            this.addRow(newWord, isAfterMember);
            this.dataStructure.SA.push(newWord);
            addedList.push(newWord);
          }
        }
      } else {
        this.dataStructure.S.push(prefix);
        this.addRow(prefix, isAfterMember);
        addedList.push(prefix);
        this.alphabet.symbols.forEach(a => {
          let newWord = prefix + a;
          if (!this.dataStructure.SA.includes(newWord) && !this.dataStructure.S.includes(newWord)) {
            this.dataStructure.SA.push(prefix + a);
            this.addRow(prefix + a)
            addedList.push(prefix + a)
          }
        });
      }
      isAfterMember = false;
    }
    return;
  }


  /**
  * For all suffix suff of {@link newElt} if suff is not in {@link E} :
  * add suff to {@link E} and make queries for every elt in {@link SA} and
  * {@link S} relating to the new column suff
  */
  addEltIn_E(newElt: string, after_equiv = false) {
    let suffixList = generateSuffixList(newElt);
    for (const suffix of suffixList) {
      if (this.dataStructure.E.includes(suffix)) break;
      this.dataStructure.SA.forEach(s => {
        if (s + suffix === newElt && after_equiv)
          this.updateObservationTable(s, boolToString(!this.automaton!.acceptWord(newElt)))
        else this.makeMember(s, suffix)
      });
      this.dataStructure.S.forEach(s => {
        if (s + suffix === newElt && after_equiv)
          this.updateObservationTable(s, boolToString(!this.automaton!.acceptWord(newElt)))
        else this.makeMember(s, suffix)
      });
      this.dataStructure.E.push(suffix);
    }
  }

  /**
   * @param rowName 
   * adds a row to the {@link dataStructure} 
   * querying the teacher for all tuple ({@link rowName}, e) where e is in {@link E}
   * @see {@link makeMember}
   */
  addRow(rowName: string, afterMember = false) {
    this.dataStructure.E.forEach(e => {
      if (afterMember && e === "")
        this.dataStructure.assoc[rowName] = boolToString(!this.automaton!.acceptWord(rowName));
      else this.makeMember(rowName, e)
    });
  }

  moveFrom_SA_to_S(elt: string) {
    const index = this.dataStructure.SA.indexOf(elt);
    if (index !== -1) this.dataStructure.SA.splice(index, 1);
    this.dataStructure.S.push(elt);
  }

  /**
   * The learner finds the next question according to 
   * current context
   */
  makeNextQuery() {
    if (this.finish) return;
    var proprerty;
    if ((proprerty = this.isClose())) {
      this.addEltInS(proprerty);
    } else if ((proprerty = this.isConsistent())) {
      let newCol = proprerty[2]
      this.addEltIn_E(newCol);
    } else if (this.automaton === undefined) {
      let automaton = this.makeAutomaton();
      this.automaton = automaton;
      this.counterExample = this.makeEquiv(this.automaton);
    } else {
      if (this.counterExample !== undefined) {
        this.updateTableAfterEquiv(this.counterExample!, false)
        this.automaton = undefined;
        this.counterExample = undefined
      } else {
        this.finish = true;
      }
    }
  }

  /**
   * Every learner can update differently the observation table according to its implementation
   * @param answer the answer of teacher after equiv question
   */
  abstract updateTableAfterEquiv(answer: string, after_equiv: boolean): void;

  abstract isClose(): string | undefined;

  abstract isConsistent(): string[] | undefined;

  sameRow(a: string, b: string) {
    return this.dataStructure.assoc[a] === this.dataStructure.assoc[b];
  }

  getConsistentCounter() {
    return this.consistenceCounter;
  }

  getClosednessCounter() {
    return this.closednessCounter;
  }
}