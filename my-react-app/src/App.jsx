// App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Home from './pages/home';
import About from './pages/about';
import Pricing from './pages/pricing';
import ImageGallery from './pages/ImageGallery.jsx';
import ImageManagement from './pages/ImageManagement';
import ImageMapViewer from './pages/ImageMapViewer';
import ImageAutoBrighten from './pages/ImageAutoBrighten';
import Purge from './pages/purge';
import ClusterGallery from './pages/ClusterGallery';
import SmartMap from './pages/SmartMap';
import ImageLook from './pages/ImageLook';
import FaceInspector from './pages/FaceInspector'; // ✅ NEW
import SmartPhoto from './pages/SmartPhoto'; // ✅ New route
import MemoryLanePage from './pages/MemoryLanePage';
import Features from './pages/features';
import Contact from './pages/contact';
import SignIn from './pages/signup';
import Help from './pages/help';
import Dashboard from './pages/Dashboard';
import Initial from './pages/Initial';
import TermsOfService from './pages/tos';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<ImageGallery />} />
        <Route path="/manage/:id" element={<ImageManagement />} />
        <Route path="/images" element={<ImageMapViewer />} />
        <Route path="/autobrighten" element={<ImageAutoBrighten />} />
        <Route path="/purge" element={<Purge />} />
        <Route path="/clusters" element={<ClusterGallery />} />
        <Route path="/maponly/:original_name" element={<SmartMap />} />
        <Route path="/imagelook" element={<ImageLook />} />
        <Route path="/imagelook/:id" element={<ImageLook />} />
        <Route path="/inspect" element={<FaceInspector />} /> {/* ✅ NEW */}
        <Route path="/smart" element={<SmartPhoto />} /> {/* ✅ New */}
        <Route path="/initial" element={<Initial />} />
        <Route path="/memorylane" element={<MemoryLanePage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<SignIn />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </Router>
  );
}

export default App;
