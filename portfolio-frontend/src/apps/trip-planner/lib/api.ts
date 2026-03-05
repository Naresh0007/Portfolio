import axios from 'axios';
import { TripRequest, TripOption } from '../types';

const API_BASE_URL = '/api';

export async function fetchTrips(params: TripRequest): Promise<TripOption[]> {
    const response = await axios.get(`${API_BASE_URL}/trip`, { params });
    return response.data;
}

export interface StopSuggestion {
    id: string;
    name: string;
}

export async function fetchStops(name: string): Promise<StopSuggestion[]> {
    if (!name || name.length < 2) return [];
    const response = await axios.get(`${API_BASE_URL}/trip/stops`, { params: { name } });
    return response.data;
}
