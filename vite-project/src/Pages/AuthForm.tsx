import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ipoStatusApi } from '@/services/ipostatusApi'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie';
import { setUser } from '../store/authSlice';
import { useDispatch } from 'react-redux';


const AuthForm = () => {
    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')
    const dispatch = useDispatch();

    const handleLogin = async () => {
        if (!email) {
            toast.error("Please fill the email ");
            return;
        }

        if (!password) {
            toast.error("Please fill the password");
            return;
        }

        var data = {
            email,
            password
        };

        try {
            const ldata = await ipoStatusApi.login<any>(data);

            // Assuming your API returns a token in the response
            if (ldata.data && ldata.data.token) {
                // Store the token in a cookie
                Cookies.set('authToken', ldata.data.token);
                dispatch(setUser(ldata.data))

            } else {
                toast.error("Invalid login credentials");
            }
        } catch (error) {
            console.error('Login failed:', error);
            toast.error("Login failed. Please try again.");
        }
    };

    return (
        <div className={cn("grid gap-6")} >
            <div className="grid gap-2">
                <div className="grid gap-1">
                    <Label className="sr-only" htmlFor="email">
                        Email
                    </Label>
                    <Input
                        onChange={(event) => { setemail(event.target.value) }}

                        id="email"
                        placeholder="name@example.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                    />
                </div>
                <div className="grid gap-1">
                    <Label className="sr-only" htmlFor="email">
                        Password
                    </Label>
                    <Input
                        onChange={(event) => { setpassword(event.target.value) }}
                        id="password"
                        placeholder="name@example.com"
                        type="password"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                    />
                </div>
                <Button onClick={handleLogin} disabled={false}>Sign In with Email</Button>
                {/* <Link
                        to="/home"
                        className={cn("inline-flex items-center justify-center h-11  px-8 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                    >
                        Sign In with Email
                    </Link> */}
            </div>
        </div>
    )
}

export default AuthForm