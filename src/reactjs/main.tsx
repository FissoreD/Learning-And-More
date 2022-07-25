import React from "react";
import { Row } from "react-bootstrap";


export default class Home extends React.Component<{}, {}> {
  constructor(prop: {}) {
    super(prop)
    window.history.pushState("", "", "/")
  }

  render(): React.ReactNode {
    return <>
      <Row className="justify-content-center" >
        This is the home
      </Row>
    </>
  }
}