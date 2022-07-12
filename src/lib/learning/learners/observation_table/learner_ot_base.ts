import { boolToString, generate_prefix_list, generate_suffix_list } from "../../../tools";
import Teacher from "../../teachers/teacher";
import LearnerFather from "../learner_father";
import ObservationTable from "./observation_table";

export default abstract class LearnerOTBase extends LearnerFather<ObservationTable> {
  closedness_counter: number;
  consistence_counter: number;
  counter_example: string | undefined = "";

  constructor(teacher: Teacher) {
    super(teacher, new ObservationTable([...teacher.alphabet]))
    this.closedness_counter = 0;
    this.consistence_counter = 0;
    this.add_row("")
    this.data_structure.SA.forEach(elt => this.add_row(elt));
  }

  update_observation_table(key: string, value: string) {
    let old_value = this.data_structure.assoc[key];
    if (old_value !== undefined) value = old_value + value
    this.data_structure.assoc[key] = value;
  }

  /**
   * 1. Takes s in {@link S} and e in {@link E} which creating a word 
   * 2. Asks to the {@link teacher} if word is accepted  
   * 3. Updates {@link data_structure} wrt the answer  
   * No modification is performed in {@link S}, {@link E} or {@link SA} sets
   */
  make_member(pref: string, suff: string) {
    let word = pref + suff;
    let answer: string;
    // If we know already the answer, we do not query the teacher
    for (let i = 0; i < word.length + 1; i++) {
      let pref1 = word.substring(0, i);
      let suff1 = word.substring(i);
      if (pref1 === pref) continue;
      if (this.data_structure.E.includes(suff1)) {
        if ((this.data_structure.S.includes(pref1) || this.data_structure.SA.includes(pref1)) && this.data_structure.assoc[pref1]) {
          answer = this.data_structure.assoc[pref1].charAt(this.data_structure.E.indexOf(suff1));
          this.update_observation_table(pref, answer)
          if (answer === undefined) throw new Error('Parameter is not a number!');
          return;
        }
      }
    }
    answer = boolToString(this.teacher.member(word));
    this.update_observation_table(pref, answer)
    this.member_number++;
  }

  /**
   * For all prefix p of {@link new_elt} if p is not in {@link S} :
   * remove p from {@link SA} and add it to {@link S}
   * @param new_elt the {@link new_elt} to add in {@link S}
   * @returns the list of added elt in SA or S
   */
  add_elt_in_S(new_elt: string, after_member = false): void {
    let added_list: string[] = [];
    let prefix_list = generate_prefix_list(new_elt);
    for (const prefix of prefix_list) {
      if (this.data_structure.S.includes(prefix)) return;
      if (this.data_structure.SA.includes(prefix)) {
        this.move_from_SA_to_S(prefix);
        for (const a of this.alphabet) {
          const new_word = prefix + a;
          if (!this.data_structure.SA.includes(new_word) && !this.data_structure.S.includes(new_word)) {
            this.add_row(new_word, after_member);
            this.data_structure.SA.push(new_word);
            added_list.push(new_word);
          }
        }
      } else {
        this.data_structure.S.push(prefix);
        this.add_row(prefix, after_member);
        added_list.push(prefix);
        this.alphabet.forEach(a => {
          let new_word = prefix + a;
          if (!this.data_structure.SA.includes(new_word) && !this.data_structure.S.includes(new_word)) {
            this.data_structure.SA.push(prefix + a);
            this.add_row(prefix + a)
            added_list.push(prefix + a)
          }
        });
      }
      after_member = false;
    }
    return;
  }


  /**
  * For all suffix suff of {@link new_elt} if suff is not in {@link E} :
  * add suff to {@link E} and make queries for every elt in {@link SA} and
  * {@link S} relating to the new column suff
  */
  add_elt_in_E(new_elt: string, after_equiv = false) {
    let suffix_list = generate_suffix_list(new_elt);
    for (const suffix of suffix_list) {
      if (this.data_structure.E.includes(suffix)) break;
      this.data_structure.SA.forEach(s => {
        if (s + suffix === new_elt && after_equiv)
          this.update_observation_table(s, boolToString(!this.automaton!.accept_word(new_elt)))
        else this.make_member(s, suffix)
      });
      this.data_structure.S.forEach(s => {
        if (s + suffix === new_elt && after_equiv)
          this.update_observation_table(s, boolToString(!this.automaton!.accept_word(new_elt)))
        else this.make_member(s, suffix)
      });
      this.data_structure.E.push(suffix);
    }
  }

  /**
   * @param row_name 
   * adds a row to the {@link data_structure} 
   * querying the teacher for all tuple ({@link row_name}, e) where e is in {@link E}
   * @see {@link make_member}
   */
  add_row(row_name: string, after_member = false) {
    this.data_structure.E.forEach(e => {
      if (after_member && e === "")
        this.data_structure.assoc[row_name] = boolToString(!this.automaton!.accept_word(row_name));
      else this.make_member(row_name, e)
    });
  }

  move_from_SA_to_S(elt: string) {
    const index = this.data_structure.SA.indexOf(elt);
    if (index !== -1) this.data_structure.SA.splice(index, 1);
    this.data_structure.S.push(elt);
  }

  /**
   * The learner finds the next question according to 
   * current context
   */
  make_next_query() {
    if (this.finish) return;
    var proprerty;
    if ((proprerty = this.is_close())) {
      this.add_elt_in_S(proprerty);
    } else if ((proprerty = this.is_consistent())) {
      let new_col = proprerty[2]
      this.add_elt_in_E(new_col);
    } else if (this.automaton === undefined) {
      let automaton = this.make_automaton();
      this.automaton = automaton;
      this.counter_example = this.make_equiv(this.automaton);
    } else {
      if (this.counter_example !== undefined) {
        this.table_to_update_after_equiv(this.counter_example!, false)
        this.automaton = undefined;
        this.counter_example = undefined
      } else {
        this.finish = true;
      }
    }
  }

  /**
   * Every learner can update differently the observation table according to its implementation
   * @param answer the answer of teacher after equiv question
   */
  abstract table_to_update_after_equiv(answer: string, after_equiv: boolean): void;

  abstract is_close(): string | undefined;

  abstract is_consistent(): string[] | undefined;

  same_row(a: string, b: string) {
    return this.data_structure.assoc[a] === this.data_structure.assoc[b];
  }

  get_consistent_counter() {
    return this.consistence_counter;
  }

  get_closedness_counter() {
    return this.closedness_counter;
  }
}