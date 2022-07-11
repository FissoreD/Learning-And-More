import { Component, ReactNode } from "react";
import { ObservationTable } from "../../lib/learning/learners/observation_table/observation_table";
import { to_eps } from "../../lib/tools";

interface Prop { ot: ObservationTable; }

export class ObservationTableC extends Component<Prop>{
  create_table(name: string, cnt: string[]) {
    return cnt.map((S, pos) => <tr key={S + "trs"}>
      {pos === 0 ?
        <>
          <th key={pos + "hh"} scope="row" rowSpan={cnt.length} className="table-primary obs-table-header" style={{ width: "3pt" }}>{name}</th>
          <th key={pos} scope="row">{to_eps(S)}</th>
        </> :
        <th key={pos} scope="row">{to_eps(S)}</th>}
      {[...this.props.ot.assoc[S]].map((char, pos) => <td key={pos}>{char}</td>)}</tr>)
  }


  render(): ReactNode {
    return <table className="table table-striped align-middle text-center table-responsive">
      <thead>
        <tr>
          <th key={"EmtpyCell"}></th>
          <th key={"Header Table"}>Table</th>
          {this.props.ot.E.map((e, pos) => <th key={"Header" + pos} scope="col">{to_eps(e)}</th>)}
        </tr>
      </thead>
      <tbody>
        {this.create_table("S", this.props.ot.S)}
        {this.create_table("SA", this.props.ot.SA)}
      </tbody>
    </table>
  }
}