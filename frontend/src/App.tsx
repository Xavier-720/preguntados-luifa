import { Route, Routes } from 'react-router-dom'
import { GameProvider } from './game/GameContext'
import { GameView } from './game/GameView'
import { AdminPage } from './screens/AdminPage'
import { NotFoundPage } from './screens/NotFoundPage'

function GamePage() {
  return (
    <GameProvider>
      <GameView />
    </GameProvider>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GamePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
