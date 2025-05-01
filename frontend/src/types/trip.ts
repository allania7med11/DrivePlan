export type LogSheet = {
    activities: {
        start: number;
        end: number;
        status: string;
    }[];
    remarks?: {
        start: number;
        end: number;
        location: string;
        information: string;
    }[];
    total_hours_by_status?: Record<string, number>;
    total_hours?: number;
};

export type TripResult = {
    routes: [number, number][][];
    rests: {
        name: string;
        coords: [number, number];
    }[];
    log_sheets: LogSheet[];
};
