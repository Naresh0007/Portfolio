import Hero from './components/Hero';
import ExperienceTimeline from './components/ExperienceTimeline';
import ProjectShowcase from './components/ProjectShowcase';
import SkillsVisualization from './components/SkillsVisualization';
import StatsCounter from './components/StatsCounter';

export default function Home() {
    return (
        <>
            <Hero />
            <StatsCounter />
            <ExperienceTimeline />
            <ProjectShowcase />
            <SkillsVisualization />
        </>
    );
}
