import React from "react";
import { Table } from "react-bootstrap";
import biblio from "../../json/bibliography.json";

const columns = ["year", "author", "title", "description"] as const
let sortedBiblio = Object.values(biblio).sort((a, b) => (a.year as number) - (b.year as number))

export default class BibliographyPage extends React.Component {
  render(): React.ReactNode {
    return <>
      {/* <h1>Bibliography</h1> */}
      <Table responsive striped className="align-middle text-center">
        <thead>
          <tr>
            {columns.map(e => <td>{e.charAt(0).toUpperCase() + e.slice(1)}</td>)}
          </tr>
        </thead>
        <tbody>
          {sortedBiblio.map((e, pos) => <tr key={pos}>
            {
              columns.map(col => <td key={col}>{col === "title" ? <a target={"_blank"} href={e.href}>{e[col]}</a> : e[col]}</td>)
            }
          </tr>)}
        </tbody>
      </Table>
    </>
  }
}