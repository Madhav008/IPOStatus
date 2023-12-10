import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoutes from './components/ProtectedRoute';
import AuthPage from './Pages/AuthPage';
import { Toaster } from 'react-hot-toast';
import SidebarPage from './Pages/SidebarPage';

function App() {

  return (
    <div >
      <Router>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path='/home' element={<SidebarPage />} />
          <Route element={<ProtectedRoutes />}>
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </div>
  )
}

export default App
