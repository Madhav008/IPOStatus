// ProtectedRoutes.jsx
import { Outlet, Navigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { useSelector } from 'react-redux';


const ProtectedRoutes = () => {
    const user = useSelector((state: RootState) => state.auth.user);


    return user?._id ? <Outlet /> : <Navigate to="/" />


};

export default ProtectedRoutes;