import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import TripPlannerApp from './apps/trip-planner/TripPlannerApp';
import JobHuntApp from './apps/job-hunt/JobHuntApp';
import LinkedInAIApp from './apps/linkedin-ai/LinkedInAIApp';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import './apps/linkedin-ai/LinkedInAI.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trip-planner" element={<TripPlannerApp />} />
          <Route path="/job-hunt/*" element={<JobHuntApp />} />
          <Route path="/linkedin-ai/*" element={<LinkedInAIApp />} />
        </Routes>
        <Footer />
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
