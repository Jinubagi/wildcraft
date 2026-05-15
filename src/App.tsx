import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Daily from './pages/Daily';
import Skills from './pages/Skills';
import AIPage from './pages/AIPage';
import Emergency from './pages/Emergency';
import Checklist from './pages/Checklist';
import QnA from './pages/QnA';
import WoodCarving from './pages/WoodCarving';
import BushcraftCooking from './pages/BushcraftCooking';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="daily" element={<Daily />} />
          <Route path="skills/:category" element={<Skills />} />
          <Route path="ai" element={<AIPage />} />
          <Route path="emergency" element={<Emergency />} />
          <Route path="checklist" element={<Checklist />} />
          <Route path="qna" element={<QnA />} />
          <Route path="woodcarving" element={<WoodCarving />} />
          <Route path="cooking" element={<BushcraftCooking />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
