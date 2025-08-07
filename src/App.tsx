import type { JSX } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import UploadRoute from './components/UploadRoute'

function App(): JSX.Element {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Hello World</h1>} />
        <Route path="/uploadRoute" element={<UploadRoute />} />
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>
    </Router>
  )
}

export default App
