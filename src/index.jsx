import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from './pages/Main';
import Join from './pages/Join'
import Ready from './pages/Ready';
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Main />}/>
          <Route path="/join" element={<Join />} />
          <Route path="/ready" element={<Ready />} />
      </Routes>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
