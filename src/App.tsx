import { Routes, Route } from 'react-router-dom';
import PrivacyPolicy from './pages/privacy-policy';
import ExtensionView from './pages/ExtensionView';

function App() {
  return (
    <Routes>
      <Route path='/' element={<ExtensionView />} />
      <Route path='/privacy-policy' element={<PrivacyPolicy />} />
    </Routes>
  );
}

export default App;
