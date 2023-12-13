import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoutes from './components/ProtectedRoute';
import AuthPage from './Pages/AuthPage';
import { Toaster } from 'react-hot-toast';
import SidebarPage from './Pages/SidebarPage';
import { useEffect } from 'react';
import { ipoStatusApi } from './services/ipostatusApi';
import { useDispatch } from 'react-redux';
import { setUser } from './store/authSlice';
import AccountSidebarPage from './Pages/AccountSidebar';

function App() {

  const dispatch = useDispatch();

  async function getProfile() {
    const res = await ipoStatusApi.getProfile()
    dispatch(setUser(res.data))
  }

  useEffect(() => {
    getProfile()
  }, [dispatch])

  return (
    <div >
      <Router>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route element={<ProtectedRoutes />}>
            <Route path='/home' element={<SidebarPage />} />
            <Route path='/account' element={<AccountSidebarPage />} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </div>
  )
}

export default App
