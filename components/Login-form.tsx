"use client";

import { useActionState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { login, LoginState } from "@/app/(auth)/login/actions";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Loader, MessageCircle } from "lucide-react";

export default function LoginForm() {
  const [state, formAtion, pending] = useActionState<LoginState, FormData>(
    login,
    {
      success: null,
      message: "",
    }
  );
  return (
    <Card className="mx-auto w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Ligin</CardTitle>
        <CardDescription>
          Digite seu email para receber um link de login.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAtion}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="ivan@email.com"
                required
              />
            </div>
            {state.success === true && (
              <Alert className="text-muted-foreground">
                <MessageCircle className="h-4 w-4 !text-green-600" />
                <AlertTitle className="text-gray-50">Email enviado!</AlertTitle>
                <AlertDescription>
                  Confira o seu inbox para acessar o link de login
                </AlertDescription>
              </Alert>
            )}

            {state.success === false && (
              <Alert className="text-muted-foreground">
                <MessageCircle className="h-4 w-4 !text-red-600" />
                <AlertTitle className="text-gray-50">Erro</AlertTitle>
                <AlertDescription>
                  Ocorreu um erro ao enviar o link de login. Por favor entre em
                  contado com o suporte!
                </AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full">
              {pending && <Loader className="animate-spin" />}
              Login
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
