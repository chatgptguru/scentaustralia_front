import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme/theme';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import AIChat from './pages/AIChat/AIChat';
import DocumentGenerator from './pages/DocumentGenerator/DocumentGenerator';
import LeadGenerator from './pages/LeadGenerator/LeadGenerator';
import Knowledgebase from './pages/Knowledgebase/Knowledgebase';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="/documents" element={<DocumentGenerator />} />
            <Route path="/leads" element={<LeadGenerator />} />
            <Route path="/knowledge" element={<Knowledgebase />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
