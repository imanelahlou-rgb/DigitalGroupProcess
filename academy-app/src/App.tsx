import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/authContext'
import LoginGate from './components/layout/LoginGate'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import Programme from './pages/Programme'
import ModulePage from './pages/ModulePage'
import LessonPage from './pages/LessonPage'
import ExercisePage from './pages/ExercisePage'
import Resources from './pages/Resources'
import ProgressionPage from './pages/ProgressionPage'
import InstructorPage from './pages/InstructorPage'
import FinalProjectPage from './pages/FinalProjectPage'
import GlossaryPage from './pages/GlossaryPage'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter basename="/academy/claude">
      <AuthProvider>
        <LoginGate>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="programme" element={<Programme />} />
              <Route path="modules/:moduleId" element={<ModulePage />} />
              <Route path="modules/:moduleId/lecons/:lessonId" element={<LessonPage />} />
              <Route path="exercices/:exerciseId" element={<ExercisePage />} />
              <Route path="ressources" element={<Resources />} />
              <Route path="progression" element={<ProgressionPage />} />
              <Route path="formateur" element={<InstructorPage />} />
              <Route path="projet-final" element={<FinalProjectPage />} />
              <Route path="glossaire" element={<GlossaryPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </LoginGate>
      </AuthProvider>
    </BrowserRouter>
  )
}
