import { same_vector } from "../../../tools";

export default class ObservationTable {
  private columns: string[];
  private rows: string[];
  private matrix: boolean[][];
  E: string[];
  S: string[];
  SA: string[];
  assoc: { [key: string]: string }
  alphabet: string[];

  constructor(alphabet: string[]) {
    this.columns = []
    this.rows = []
    this.matrix = [[]];
    this.E = [""]
    this.S = [""]
    this.SA = [...alphabet]
    this.assoc = {}
    this.alphabet = alphabet;
  }

  add_column(column_name: string) {
    this.columns.push(column_name);
  }

  add_row(row_name: string) {
    this.rows.push(row_name);
  }

  set_value(row_name: string, column_name: string, bool: boolean) {
    this.matrix[this.rows.indexOf(row_name)][this.columns.indexOf(column_name)] = bool;
  }

  /**
   * @returns the value at row_name, column_name of the matrix
   */
  get_value(row_name: string, column_name: string) {
    return this.matrix[this.rows.indexOf(row_name)][this.columns.indexOf(column_name)];
  }

  /**
   * @returns the list of boolean of row_name 
   */
  get_row(row_name: string) {
    return this.matrix[this.rows.indexOf(row_name)];
  }

  /**
   * @return if row1 === row2
   */
  same_row(row1: string, row2: string) {
    const r1 = this.get_row(row1);
    const r2 = this.get_row(row2);
    return r1 !== undefined && r2 !== undefined &&
      same_vector(r1, r2);
  }

  clone() {
    let clone = new ObservationTable(this.alphabet)
    clone.E = [...this.E]
    clone.S = [...this.S]
    clone.SA = [...this.SA]
    clone.assoc = { ...this.assoc }
    return clone;
  }
}