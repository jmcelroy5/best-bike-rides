export interface BikeRoute {
    id: string;
    name: string;
    description: string;
    distance: number;
    elevationGain: number;
    geoJSON: any;
    startPoint: {
        type: string;
        coordinates: [number, number];
    };
    createdAt: string;
}