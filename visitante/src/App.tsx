import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-kibo-bg p-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary-forest mb-2">Kibô-no-Iê</h1>
        <p className="text-secondary-leaf font-medium text-lg">Guia do Visitante</p>
      </header>

      <main className="w-full max-w-md space-y-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-primary-forest mb-4">Bem-vindo!</h2>
          <p className="text-gray-700 mb-6">
            Explore as barracas, confira os produtos e fique por dentro dos avisos.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/mapa" className="bg-primary-forest text-white text-center py-3 rounded-lg font-medium hover:bg-opacity-90 transition">
              Mapa do Evento
            </Link>
            <Link to="/produtos" className="bg-secondary-leaf text-white text-center py-3 rounded-lg font-medium hover:bg-opacity-90 transition">
              Catálogo de Produtos
            </Link>
            <Link to="/avisos" className="border-2 border-primary-forest text-primary-forest text-center py-3 rounded-lg font-medium hover:bg-primary-forest hover:text-white transition">
              Avisos
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-kibo-bg p-4">
      <h1 className="text-3xl font-bold text-primary-forest mb-4">{title}</h1>
      <Link to="/" className="text-secondary-leaf underline hover:text-primary-forest">Voltar ao início</Link>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mapa" element={<PlaceholderPage title="Mapa do Evento" />} />
        <Route path="/produtos" element={<PlaceholderPage title="Catálogo de Produtos" />} />
        <Route path="/avisos" element={<PlaceholderPage title="Avisos" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
