import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { loginApi } from '../api/auth.api';
import { useNavigate } from 'react-router-dom';
import ImageCarousel from '../components/ImageCarousel';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore(); // ✅ hook en el cuerpo del componente

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ✅ primera línea siempre
    setError('');
    setLoading(true);
    try {
      const data = await loginApi(email, password); // ✅ una sola llamada
      login(data.token, data.user);                  // ✅ guarda token en el store
      navigate(data.user.role === 'ADMIN' ? '/dashboard' : '/pos');
    } catch {
      setError('Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Fondo */}
      <ImageCarousel />

      {/* Formulario encima */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-xl w-96"
        >
          <link
            href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
            rel="stylesheet"
          />
          <h1 style={{
            fontFamily: "'Pacifico', cursive",
            fontSize: '50px',
            color: '#15803d',
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            Mojito Bar POS
          </h1>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <input
            className="w-full border p-2 mb-4 rounded"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full border p-2 mb-6 rounded"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}