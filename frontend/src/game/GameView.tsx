import { useConfig } from '../api/hooks'
import { AppShell } from '../components/AppShell'
import { useWakeLock } from '../lib/useWakeLock'
import { HomeScreen } from '../screens/HomeScreen'
import { PrizeScreen } from '../screens/PrizeScreen'
import { QuestionScreen } from '../screens/QuestionScreen'
import { ResultScreen } from '../screens/ResultScreen'
import { WheelScreen } from '../screens/WheelScreen'
import { useGame } from './GameContext'

export function GameView() {
  const { phase, game, round, result, stock } = useGame()
  const configQuery = useConfig()
  useWakeLock()

  const configStock = configQuery.data
    ? { hats: configQuery.data.stockHats, cups: configQuery.data.stockCups }
    : null
  const headerStock = stock ?? configStock

  let content = <HomeScreen />

  if (phase === 'wheel' && game) {
    content = <WheelScreen />
  } else if (phase === 'question' && game && round) {
    content = <QuestionScreen key={round.roundId} />
  } else if (phase === 'result' && result) {
    content = <ResultScreen />
  } else if (phase === 'prize' && game) {
    content = <PrizeScreen />
  }

  return <AppShell stock={headerStock}>{content}</AppShell>
}
