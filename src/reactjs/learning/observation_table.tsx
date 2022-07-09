import { Component, ReactNode } from "react";
import { ObservationTable } from "../../lib/learning/learners/observation_table/observation_table";

export class ObservationTableC extends Component<{}, { ot: ObservationTable }{
  constructor(prop: string, ot: ObservationTable) {
    super(prop)
    this.state = { ot }
  }

  render(): ReactNode {
    return <table>
      { }
    </table>
  }
}