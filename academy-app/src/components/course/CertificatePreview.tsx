import { Printer } from 'lucide-react'
import { COURSE_TITLE } from '../../content/course'
import BrandMark from '../layout/BrandMark'

interface Props {
  name: string
  onNameChange: (name: string) => void
  scoreLabel?: string
}

export default function CertificatePreview({ name, onNameChange, scoreLabel }: Props) {
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <section className="stack" aria-label="Aperçu de l’attestation">
      <div className="no-print stack-sm">
        <label className="field">
          <span>Nom du participant (apparaît sur l’attestation)</span>
          <input className="input" type="text" value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Prénom Nom" autoComplete="name" maxLength={80} />
        </label>
        <p className="muted small">
          Attestation de <strong>participation</strong> délivrée par DPG Academy. Elle ne constitue pas une certification Anthropic. Modalités de délivrance d’une attestation de réussite : à confirmer par DPG.
        </p>
      </div>
      <div className="certificate" id="certificate">
        <div className="certificate-inner">
          <BrandMark size="md" logoOnly />
          <p className="eyebrow">Attestation de participation</p>
          <p className="cert-lead">DPG Academy atteste que</p>
          <p className="cert-name">{name.trim() || 'Prénom Nom'}</p>
          <p className="cert-lead">a participé à l’atelier</p>
          <h3 className="cert-title">{COURSE_TITLE}</h3>
          {scoreLabel && <p className="cert-score">{scoreLabel}</p>}
          <p className="cert-date">Fait le {date}</p>
          <p className="cert-legal">
            Cette attestation certifie la participation à un atelier DPG Academy. Elle n’est ni délivrée, ni approuvée par Anthropic et ne constitue pas une certification Anthropic.
          </p>
        </div>
      </div>
      <div className="no-print">
        <button type="button" className="btn btn-primary" onClick={() => {
            const root = document.documentElement
            root.classList.add('printing-cert')
            window.addEventListener('afterprint', () => root.classList.remove('printing-cert'), { once: true })
            window.print()
          }} disabled={!name.trim()}>
          <Printer size={16} aria-hidden="true" /> Imprimer / enregistrer en PDF
        </button>
        {!name.trim() && <span className="muted small"> Saisissez votre nom pour activer l’impression.</span>}
      </div>
    </section>
  )
}
