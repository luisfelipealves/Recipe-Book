
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { NewRecipe } from './pages/NewRecipe';
import { ManageTags } from './pages/ManageTags';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewRecipe />} />
          <Route path="/tags" element={<ManageTags />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
