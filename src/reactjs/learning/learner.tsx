import { Component, ReactNode } from "react";
import { LearnerBase } from "../../lib/learning/learners/observation_table/learner_base";
import { ObservationTableC } from "./observation_table_c";

interface Prop { l: LearnerBase }

export class Learner extends Component<Prop>{
  constructor(props: Prop) {
    super(props);
    console.log(props.l);

  }

  render(): ReactNode {
    return <div>
      <div>Learner</div>
      <ObservationTableC ot={this.props.l.ot} />
    </div>
  }
}