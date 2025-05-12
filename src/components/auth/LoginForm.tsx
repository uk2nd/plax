'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useActionState } from 'react'
import { authenticate } from '@/lib/actions/authenticate' // ServerAction

export function LoginForm() {
    const [errorMessage, formAction] = useActionState(
        authenticate,
        undefined,
    );
    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>
                    ログイン
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">メールアドレス</Label>
                        <Input id="email" type="email" name="email" required></Input>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">パスワード</Label>
                        <Input id="password" type="password" name="password" required></Input>
                    </div>
                    <Button type="submit" className="w-full">ログイン</Button>
                </form>
                <div className="flex h-8 items-end space-x-1">
                    {errorMessage && (
                        <>
                        <div className="h-5 text-red-500">
                            <p className="text-sm text-red-500">{errorMessage}</p>
                        </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}