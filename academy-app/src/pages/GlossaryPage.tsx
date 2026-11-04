import GlossaryPanel from '../components/course/GlossaryPanel'
import PageHeader from '../components/ui/PageHeader'

export default function GlossaryPage() {
  return (
    <div className="page stack-lg">
      <PageHeader eyebrow="Glossaire" title="Les termes de l’atelier" lead="Définitions courtes, regroupées par ordre alphabétique et filtrables par module." />
      <GlossaryPanel />
    </div>
  )
}
