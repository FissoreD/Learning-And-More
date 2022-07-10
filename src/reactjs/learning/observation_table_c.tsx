import { Component, ReactNode } from "react";

interface Prop { ot: any; }

export class ObservationTableC extends Component<Prop>{
  render(): ReactNode {
    return <div>
      {JSON.stringify(this.props.ot)}
    </div>
  }
}