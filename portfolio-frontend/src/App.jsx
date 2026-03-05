import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import TripPlannerApp from './apps/trip-planner/TripPlannerApp';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trip-planner" element={<TripPlannerApp />} />
        </Routes>
        <Footer />
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
