import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import React from 'react'

const AuthForm = () => {
    return (
        <div className={cn("grid gap-6")} >
            <form>
                <div className="grid gap-2">
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="email">
                            Email
                        </Label>
                        <Input
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
                            id="password"
                            placeholder="name@example.com"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                        />
                    </div>
                    <Button disabled={false}>Sign In with Email</Button>
                </div>
            </form>
        </div>
    )
}

export default AuthForm