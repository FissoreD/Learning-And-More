import React from "react";
import { Table } from "react-bootstrap";
import ObservationTable from "../../../../lib/learning/learners/observation_table/ObservationTable";
import { toEps } from "../../../../lib/tools";
import { logRender } from "../../../globalFunctions";

interface Prop { dataStructure: ObservationTable; primeLines?: string[] }

export default class ObservationTableViewer extends React.Component<Prop>{
  createTable(name: string, cnt: string[]) {
    return cnt.map((S, pos) => <tr key={S + "trs"}>
      {pos === 0 ?
        <React.Fragment key={pos}>
          <th rowSpan={cnt.length} style={{ width: "3pt" }}>{name}</th>
          <th>{this.props.primeLines?.includes(S) ? '*' + toEps(S) : toEps(S)}</th>
        </React.Fragment> :
        <th key={pos}>{this.props.primeLines?.includes(S) ? '*' + toEps(S) : toEps(S)}</th>}
      {[...this.props.dataStructure.assoc[S]].map((char, pos) => <td key={pos}>{char}</td>)}</tr>)
  }


  render(): React.ReactElement {
    logRender("ObservationTable")
    return <><Table responsive striped className="align-middle text-center">
      <thead>
        <tr>
          <th></th>
          <th>Table</th>
          {this.props.dataStructure.E.map((e, pos) => <th key={"Header" + pos}>{toEps(e)}</th>)}
        </tr>
      </thead>
      <tbody>
        {this.createTable("S", this.props.dataStructure.S)}
        {this.createTable("SA", this.props.dataStructure.SA)}
      </tbody>
    </Table>
      <div className="text-start">
        {this.props.primeLines ? "* := prime rows (rows that can be formed as the union of other rows)" : ""}
      </div>
    </>
  }
}