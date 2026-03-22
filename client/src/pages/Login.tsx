import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Loader2, LogIn, UserPlus } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.login.authenticate.useMutation();
  const registerMutation = trpc.login.register.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginMutation.mutateAsync({ username, password });
      // Store user info in localStorage
      localStorage.setItem("user", JSON.stringify(result));
      localStorage.setItem("isLoggedIn", "true");
      toast.success("Login realizado com sucesso!");
      setLocation("/");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (username.length < 3) {
      toast.error("Username deve ter no mínimo 3 caracteres");
      return;
    }

    if (password.length < 6) {
      toast.error("Senha deve ter no mínimo 6 caracteres");
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerMutation.mutateAsync({ username, password });
      // Auto login after register
      localStorage.setItem("user", JSON.stringify(result));
      localStorage.setItem("isLoggedIn", "true");
      toast.success("Cadastro realizado com sucesso!");
      setLocation("/");
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <LogIn className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {isLogin ? "Bem-vindo" : "Criar Conta"}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? "Sistema de Controle de Entregas" 
              : "Cadastre-se para acessar o sistema"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Username</label>
              <Input
                type="text"
                placeholder={isLogin ? "grupotmc" : "Escolha um username"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="border-input"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Senha</label>
              <Input
                type="password"
                placeholder={isLogin ? "123456" : "Mínimo 6 caracteres"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="border-input"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Cadastrar
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setUsername("");
                setPassword("");
              }}
              className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {isLogin
                ? "Não tem conta? Cadastre-se"
                : "Já tem conta? Faça login"}
            </button>
          </div>

          {isLogin && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Credenciais padrão:</strong><br />
                Username: <code className="bg-white dark:bg-slate-800 px-1 rounded">grupotmc</code><br />
                Senha: <code className="bg-white dark:bg-slate-800 px-1 rounded">123456</code>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
