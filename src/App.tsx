import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import TestModulesPage from './pages/TestModulesPage';
import './App.css';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🎓 Hệ thống Học Liệu
        </Link>
        <div className="nav-links">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
          >
            🤖 Chatbot AI
          </Link>
          <Link 
            to="/test-modules" 
            className={location.pathname === '/test-modules' ? 'nav-link active' : 'nav-link'}
          >
            🧪 Test Modules
          </Link>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <Navigation />
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/test-modules" element={<TestModulesPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;


