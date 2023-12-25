import { Navigate } from 'react-router-dom'
import AuthForm from './AuthForm'
import { RootState } from '../store/store';
import { useSelector } from 'react-redux';


const AuthPage = () => {
    const userData = useSelector((state: RootState) => state.auth.user);
    if (userData?._id) {
        return <Navigate to="/home" />
    }



    return (


        <div>
            <div className=" flex items-center text-lg font-medium">
                <div className='flex gap-4 m-6'>
                    <svg className="w-8 text-deep-purple-accent-400" viewBox="0 0 24 24" stroke-linejoin="round" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" stroke="currentColor" fill="none">
                        <rect x="3" y="1" width="7" height="12"></rect>
                        <rect x="3" y="17" width="7" height="6"></rect>
                        <rect x="14" y="1" width="7" height="6"></rect>
                        <rect x="14" y="11" width="7" height="12"></rect>
                    </svg>
                    <span>IPO Allotment Status</span>
                </div>
            </div>
            <div className="container top-52  flex-col items-center justify-center  lg:max-w-none lg:px-0 h-[88vh]">

                <div className="lg:p-8">

                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] gap-6">
                        <div className="flex flex-col space-y-2 text-center">
                            <h1 className="text-4xl font-semibold tracking-tight">Welcome Back</h1>
                            <p className="text-sm text-muted-foreground">
                                Enter your email below to login
                            </p>
                        </div>
                        <AuthForm />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthPage