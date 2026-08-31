import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { MapPin, Utensils, Megaphone } from 'lucide-react';
import Produtos from './pages/Produtos';
import Mapa from './pages/Mapa';
import Avisos from './pages/Avisos';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-kibo-bg p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-secondary-leaf opacity-10 rounded-full blur-3xl"></div>

      <header className="text-center mb-10 relative z-10">
        <div className="flex justify-center mb-4">
          <img src="/festival-logo.png" alt="Logo Kibô-no-Iê" className="w-46 h-auto" />
        </div>
      </header>

      <main className="w-full max-w-md space-y-4 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-8 border border-[#E1EBE0]">
          <h2 className="text-2xl font-bold text-[#1B261D] mb-3">Bem-vindo(a)!</h2>
          <p className="text-[#566755] mb-8 text-sm leading-relaxed">
            Explore as barracas da festa, confira nosso cardápio completo e fique por dentro de todos os avisos do festival.
          </p>
          <div className="flex flex-col gap-4">
            <Link
              to="/mapa"
              className="flex items-center gap-4 bg-primary-forest text-white p-4 rounded-2xl font-semibold hover:bg-opacity-90 hover:scale-[1.02] transition-all shadow-md group"
            >
              <div className="bg-white/20 p-2 rounded-xl">
                <MapPin size={24} className="text-white group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-lg">Mapa do Evento</span>
            </Link>

            <Link
              to="/produtos"
              className="flex items-center gap-4 bg-secondary-leaf text-[#13301A] p-4 rounded-2xl font-bold hover:bg-opacity-90 hover:scale-[1.02] transition-all shadow-md group"
            >
              <div className="bg-white/30 p-2 rounded-xl">
                <Utensils size={24} className="text-[#13301A] group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-lg">Comidas & Bebidas</span>
            </Link>

            <Link
              to="/avisos"
              className="flex items-center gap-4 bg-[#EFF7E1] border border-secondary-leaf/30 text-primary-forest p-4 rounded-2xl font-semibold hover:bg-[#E4F2CE] hover:scale-[1.02] transition-all group"
            >
              <div className="bg-primary-forest/10 p-2 rounded-xl">
                <Megaphone size={24} className="text-primary-forest group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-lg">Quadro de Avisos</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center mt-12 w-full text-[#566755]">
          
          <div className="w-full mb-8">
            <p className="text-xs uppercase tracking-wider mb-4 font-semibold text-center text-secondary-leaf">Patrocínio Platinum</p>
            <div className="flex justify-center items-center w-full">
              <img src="/auth-plus-logo.png" alt="Sponsor Platinum" className="h-20 w-auto object-contain" />
              <img src="/kibo-no-ie_logo.png" alt="Sponsor Platinum" className="h-20 w-auto object-contain" />
            </div>
          </div>

          <div className="w-full">
            <p className="text-xs uppercase tracking-wider mb-4 font-semibold text-center text-secondary-leaf">Patrocínio Master</p>
            <div className="flex flex-wrap justify-center items-center gap-y-6 w-full">
              <div className="flex justify-center basis-1/3 px-2">
                <img src="/auth-plus-logo.png" alt="Sponsor Master 1" className="h-12 w-auto object-contain opacity-90" />
              </div>
              <div className="flex justify-center basis-1/3 px-2">
                <img src="/auth-plus-logo.png" alt="Sponsor Master 2" className="h-12 w-auto object-contain opacity-90" />
              </div>
              <div className="flex justify-center basis-1/3 px-2">
                <img src="/auth-plus-logo.png" alt="Sponsor Master 3" className="h-12 w-auto object-contain opacity-90" />
              </div>
              <div className="flex justify-center basis-1/3 px-2">
                <img src="/auth-plus-logo.png" alt="Sponsor Master 4" className="h-12 w-auto object-contain opacity-90" />
              </div>
              <div className="flex justify-center basis-1/3 px-2">
                <img src="/auth-plus-logo.png" alt="Sponsor Master 5" className="h-12 w-auto object-contain opacity-90" />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/avisos" element={<Avisos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
