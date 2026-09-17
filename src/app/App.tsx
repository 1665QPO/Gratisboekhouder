import { HashRouter, Route, Routes } from 'react-router-dom'
import { AangiftePage } from '../features/export/AangiftePage'
import { ImportPage } from '../features/import/ImportPage'
import { ReceiptsPage } from '../features/receipts/ReceiptsPage'
import { TransactionsPage } from '../features/transactions/TransactionsPage'
import { Layout } from './Layout'
import { Home } from './pages/Home'
import { Privacy } from './pages/Privacy'

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/transacties" element={<TransactionsPage />} />
          <Route path="/bonnetjes" element={<ReceiptsPage />} />
          <Route path="/aangifte" element={<AangiftePage />} />
          <Route path="/privacy" element={<Privacy />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
