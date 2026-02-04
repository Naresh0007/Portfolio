const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
    async getExperiences() {
        const response = await fetch(`${API_BASE_URL}/experience`);
        if (!response.ok) throw new Error('Failed to fetch experiences');
        return response.json();
    },

    async getProjects(category = null) {
        const url = category
            ? `${API_BASE_URL}/projects?category=${category}`
            : `${API_BASE_URL}/projects`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch projects');
        return response.json();
    },

    async getFeaturedProjects() {
        const response = await fetch(`${API_BASE_URL}/projects/featured`);
        if (!response.ok) throw new Error('Failed to fetch featured projects');
        return response.json();
    },

    async getSkills() {
        const response = await fetch(`${API_BASE_URL}/skills`);
        if (!response.ok) throw new Error('Failed to fetch skills');
        return response.json();
    },

    async getStats() {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    }
};
