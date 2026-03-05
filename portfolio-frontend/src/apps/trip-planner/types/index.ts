export interface TripRequest {
    origin: string;
    destination: string;
    date: string;
    time: string;
    mode: 'departure' | 'arrival';
    calcNumberOfTrips?: number;
}

export interface StopSequence {
    name: string;
    time: string;
}

export interface TripLeg {
    mode: string;
    line?: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    duration: number;
    stops?: StopSequence[];
}

export interface TripOption {
    id: string;
    totalDuration: number;
    departureTime: string;
    arrivalTime: string;
    transfers: number;
    legs: TripLeg[];
}
