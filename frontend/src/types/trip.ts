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

export type Rest = {
    name: string;
    coords: [number, number];
}

export type TripResult = {
    routes: [number, number][][];
    rests: {
        inputs: Rest[];
        duty_limit: Rest[];
        refill: Rest[];
    };
    log_sheets: LogSheet[];
};
