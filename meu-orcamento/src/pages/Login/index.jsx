// src/pages/Login/index.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaGoogle, FaEnvelope, FaLock, FaChartLine } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [displayName, setDisplayName] = useState('');
  
  const { login, register, loginWithGoogle, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegistering) {
        await register(email, password, displayName);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro na autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro no login com Google:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-600 p-4 rounded-full">
              <FaChartLine className="text-white text-4xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Meu Orçamento</h1>
          <p className="text-gray-600 mt-2">
            {isRegistering ? 'Crie sua conta para começar' : 'Faça login para continuar'}
          </p>
        </div>

        {/* Card de Login */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome (apenas no registro) */}
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Seu nome"
                  required={isRegistering}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Links de ação */}
            {!isRegistering && (
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Esqueceu a senha?
                </Link>
              </div>
            )}

            {/* Botão de Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                isRegistering ? 'Criar Conta' : 'Entrar'
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou continue com</span>
            </div>
          </div>

          {/* Login com Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <FaGoogle className="text-xl" />
            <span>Google</span>
          </button>

          {/* Toggle entre Login e Registro */}
          <div className="mt-6 text-center">
            <span className="text-gray-600">
              {isRegistering ? 'Já tem uma conta?' : 'Não tem uma conta?'}
            </span>
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="ml-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              {isRegistering ? 'Fazer Login' : 'Criar Conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;