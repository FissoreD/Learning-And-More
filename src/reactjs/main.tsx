import React from "react";
import { Row } from "react-bootstrap";
import { setFromPosition } from "./globalFunctions";


export default class Home extends React.Component<{}, {}> {
  constructor(prop: {}) {
    super(prop)
    setFromPosition("", 0)
  }

  render(): React.ReactNode {
    return <>
      <Row className="justify-content-center" >
        This is the home
      </Row>
    </>
  }
}