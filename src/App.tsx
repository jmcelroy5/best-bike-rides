import type { JSX } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import MainLayout from './components/MainLayout'
import UploadRoute from './pages/UploadRoute'
import Home from './pages/Home'

function App(): JSX.Element {
  return (
    <Router>
      <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/uploadRoute" element={<UploadRoute />} />
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </MainLayout>
    </Router>
  )
}

export default App
