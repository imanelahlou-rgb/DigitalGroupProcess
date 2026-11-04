import { Link } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'

export default function NotFound({ what = 'Cette page' }: { what?: string }) {
  return (
    <div className="page stack-lg">
      <PageHeader eyebrow="Erreur 404" title={`${what} est introuvable`} lead="Le lien est peut-être obsolète. Retournez au tableau de bord ou consultez le programme." />
      <div className="row wrap">
        <Link to="/" className="btn btn-primary">
          Tableau de bord
        </Link>
        <Link to="/programme" className="btn btn-ghost">
          Programme
        </Link>
      </div>
    </div>
  )
}
