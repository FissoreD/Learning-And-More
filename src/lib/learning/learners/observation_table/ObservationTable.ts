import { sameVector } from "../../../tools";

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

  addColumn(columnName: string) {
    this.columns.push(columnName);
  }

  addRow(rowName: string) {
    this.rows.push(rowName);
  }

  setValue(rowName: string, columnName: string, bool: boolean) {
    this.matrix[this.rows.indexOf(rowName)][this.columns.indexOf(columnName)] = bool;
  }

  /**
   * @returns the value at rowName, columnName of the matrix
   */
  getValue(rowName: string, columnName: string) {
    return this.matrix[this.rows.indexOf(rowName)][this.columns.indexOf(columnName)];
  }

  /**
   * @returns the list of boolean of rowName
   */
  getRow(rowName: string) {
    return this.matrix[this.rows.indexOf(rowName)];
  }

  /**
   * @return if row1 === row2
   */
  sameRow(row1: string, row2: string) {
    const r1 = this.getRow(row1);
    const r2 = this.getRow(row2);
    return r1 !== undefined && r2 !== undefined &&
      sameVector(r1, r2);
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