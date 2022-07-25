import React from "react";
import { Row } from "react-bootstrap";
import { setUrl } from "./globalFunctions";


export default class Home extends React.Component<{}, {}> {
  constructor(prop: {}) {
    super(prop)
    setUrl("/")
  }

  render(): React.ReactNode {
    return <>
      <Row className="justify-content-center" >
        This is the home
      </Row>
    </>
  }
}