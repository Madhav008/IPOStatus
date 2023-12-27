import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoutes from './components/ProtectedRoute';
import AuthPage from './Pages/AuthPage';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { ipoStatusApi } from './services/ipostatusApi';
import { useDispatch } from 'react-redux';
import { setUser } from './store/authSlice';
import AccountPage from './Pages/AccountPage';
import Home from './Pages/Home';
import AdminPage from './Pages/AdminPage';
import Footer from './components/Footer';
import { logAnalyticsEvent } from './store/firebase';


function App() {

  const dispatch = useDispatch();

  async function getProfile() {
    const res = await ipoStatusApi.getProfile()
    dispatch(setUser(res.data))
    logAnalyticsEvent("profile_fetched");
  }


  useEffect(() => {
    getProfile()
  }, [dispatch])

  return (
    <div className='flex flex-col justify-between h-[100vh]'>
      <div>
        <Router>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route element={<ProtectedRoutes />}>
              <Route path='/home' element={<Home />} />
              <Route path='/admin' element={<AdminPage />} />
              <Route path='/account' element={<AccountPage />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </div>
      <div>
        <Footer />
      </div>
    </div>
  )
}

export default App
