import { Download, ExternalLink, FileText } from 'lucide-react'
import type { Asset } from '../../content/types'
import { RESOURCE_DIR } from '../../content/resources'
import { downloadText } from '../../lib/clipboard'
import CopyButton from './CopyButton'

interface Props {
  asset: Asset
  origin?: string
  showPreview?: boolean
}

/** URL publique d'un fichier publié (relative à la base de l'application). */
export function resourceUrl(filename: string): string {
  return `${import.meta.env.BASE_URL}${RESOURCE_DIR}${filename.split('/').map(encodeURIComponent).join('/')}`
}

export default function DownloadAsset({ asset, origin, showPreview = false }: Props) {
  const hasContent = typeof asset.content === 'string' && asset.content.length > 0
  const isFile = asset.kind === 'file'
  return (
    <div className="asset-card">
      <div className="asset-main">
        <FileText size={20} aria-hidden="true" className="asset-icon" />
        <div>
          <p className="asset-name">{asset.filename}</p>
          <p className="muted small">{asset.description}</p>
          {origin && <p className="muted tiny">{origin}</p>}
          {isFile && hasContent && <p className="muted tiny mono">{`${RESOURCE_DIR}${asset.filename}`}</p>}
        </div>
      </div>
      <div className="asset-actions">
        {hasContent && <CopyButton text={asset.content as string} label="Copier le contenu" />}
        {hasContent && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => downloadText(asset.filename, asset.content as string, asset.mimeType)}>
            <Download size={14} aria-hidden="true" /> Télécharger
          </button>
        )}
        {asset.kind === 'link' && asset.url && (
          <a className="btn btn-ghost btn-sm" href={asset.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={14} aria-hidden="true" /> Ouvrir
          </a>
        )}
        {isFile && hasContent && (
          <a className="btn btn-ghost btn-sm" href={resourceUrl(asset.filename)} download={asset.filename}>
            <Download size={14} aria-hidden="true" /> Fichier publié
          </a>
        )}
      </div>
      {showPreview && hasContent && (
        <details className="asset-preview">
          <summary>Aperçu du contenu</summary>
          <pre tabIndex={0}>
            <code>{asset.content}</code>
          </pre>
        </details>
      )}
    </div>
  )
}
