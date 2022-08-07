import React, { ReactNode } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

interface ReactProp { cnt: JSX.Element, title: string }

export default class TooltipImg extends React.Component<ReactProp, {}>{
  render(): ReactNode {
    return <>
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip >{this.props.title}</Tooltip>
        }
      >
        {this.props.cnt}
      </OverlayTrigger>
    </>
  }
}