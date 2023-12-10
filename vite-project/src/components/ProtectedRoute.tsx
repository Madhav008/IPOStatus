// ProtectedRoutes.jsx
import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';


const ProtectedRoutes = () => {
    const { userData } = useSelector((state: any) => state.user);

    return userData.authenticated === true ? <Outlet /> : <Navigate to="/" />


};

export default ProtectedRoutes;