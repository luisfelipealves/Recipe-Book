
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { NewRecipe } from './pages/NewRecipe';
import { ManageTags } from './pages/ManageTags';
import { RecipeDetail } from './pages/RecipeDetail';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Profile } from './pages/Profile';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/new"
              element={
                <ProtectedRoute>
                  <NewRecipe />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tags"
              element={
                <ProtectedRoute>
                  <ManageTags />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
};

export default App;
