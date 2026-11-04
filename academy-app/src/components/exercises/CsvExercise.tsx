import type { FileEditExercise } from '../../content/types'
import { csvDiagnostic, parseCsv } from '../../lib/validate'
import FileEditShell from './FileEditShell'

export default function CsvExercise({ exercise }: { exercise: FileEditExercise }) {
  return (
    <FileEditShell
      exercise={exercise}
      rows={10}
      extra={(text) => {
        const { header, rows } = parseCsv(text)
        const diag = csvDiagnostic(text)
        return (
          <div>
            <p className="muted small" aria-live="polite">
              {diag.columns} colonne(s) · {diag.rows} ligne(s) de données
              {diag.badRows.length > 0 && <span className="ko"> · nombre de colonnes incohérent à la ligne {diag.badRows.join(', ')}</span>}
            </p>
            {header.length > 0 && (
              <div className="table-wrap" tabIndex={0} role="region" aria-label="Aperçu du tableau">
                <table className="data-table">
                  <thead>
                    <tr>
                      {header.map((h, i) => (
                        <th key={i} scope="col">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, ri) => (
                      <tr key={ri}>
                        {header.map((_, ci) => (
                          <td key={ci}>{r[ci] ?? ''}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      }}
    />
  )
}
