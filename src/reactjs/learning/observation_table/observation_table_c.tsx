import React from "react";
import ObservationTable from "../../../lib/learning/learners/observation_table/observation_table";
import { toEps } from "../../../lib/tools";

interface Prop { dataStructure: ObservationTable; }

export class ObservationTableC extends React.Component<Prop>{
  createTable(name: string, cnt: string[]) {
    return cnt.map((S, pos) => <tr key={S + "trs"}>
      {pos === 0 ?
        <>
          <th key={pos + "hh"} scope="row" rowSpan={cnt.length} className="table-primary obs-table-header" style={{ width: "3pt" }}>{name}</th>
          <th key={pos} scope="row">{toEps(S)}</th>
        </> :
        <th key={pos} scope="row">{toEps(S)}</th>}
      {[...this.props.dataStructure.assoc[S]].map((char, pos) => <td key={pos}>{char}</td>)}</tr>)
  }


  render(): React.ReactElement {
    return <div className="table-responsive"> <table className="table table-striped align-middle text-center">
      <thead>
        <tr>
          <th key={"EmtpyCell"}></th>
          <th key={"Header Table"}>Table</th>
          {this.props.dataStructure.E.map((e, pos) => <th key={"Header" + pos} scope="col">{toEps(e)}</th>)}
        </tr>
      </thead>
      <tbody>
        {this.createTable("S", this.props.dataStructure.S)}
        {this.createTable("SA", this.props.dataStructure.SA)}
      </tbody>
    </table>
    </div>
  }
}