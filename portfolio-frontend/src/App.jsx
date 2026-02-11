import Hero from './components/Hero';
import ExperienceTimeline from './components/ExperienceTimeline';
import ProjectShowcase from './components/ProjectShowcase';
import SkillsVisualization from './components/SkillsVisualization';
import StatsCounter from './components/StatsCounter';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import './App.css';

function App() {
  return (
    <div className="App">
      <Hero />
      <StatsCounter />
      <ExperienceTimeline />
      <ProjectShowcase />
      <SkillsVisualization />
      <Footer />
      <Chatbot />
    </div>
  );
}

export default App;
