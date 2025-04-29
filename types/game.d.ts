export type Game = {
    id: number;
    name: string;
    cover?: {
        id?: number;
        image_id: string;
    };
};