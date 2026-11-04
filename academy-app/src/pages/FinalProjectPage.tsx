import FinalProject from '../components/course/FinalProject'
import PageHeader from '../components/ui/PageHeader'
import SecurityBanner from '../components/ui/SecurityBanner'

export default function FinalProjectPage() {
  return (
    <div className="page stack-lg">
      <PageHeader
        eyebrow="Projet final"
        title="Défi Océan Services"
        lead="Assemblez toute la chaîne : formats, prompt RISEN, skill, tâche planifiée, workflow, code et sécurité. Barème de 100 points."
        crumbs={[{ label: 'Tableau de bord', to: '/' }, { label: 'Projet final' }]}
      />
      <SecurityBanner compact />
      <FinalProject />
    </div>
  )
}
