import type { ComparisonTable as ComparisonTableData } from '../../content/types'

export default function ComparisonTable({ table }: { table: ComparisonTableData }) {
  return (
    <div className="table-wrap" role="region" aria-label={table.caption} tabIndex={0}>
      <table className="data-table">
        <caption>{table.caption}</caption>
        <thead>
          <tr>
            <th scope="col">Critère</th>
            {table.columns.map((c) => (
              <th scope="col" key={c}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r) => (
            <tr key={r.id}>
              <th scope="row">{r.label}</th>
              {r.cells.map((cell, i) => (
                <td key={i}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {table.footnote && <p className="muted small table-foot">{table.footnote}</p>}
    </div>
  )
}
