export type MediaProductType = 'FEED' | 'STORY' | 'REELS' | 'VIDEO' | 'CAROUSEL_ALBUM';

export interface Media {
    id: string;
    uuid: string;
    instagram_user_id: string;
    created_at: number;
    updated_at: number;
    media_product_type: MediaProductType;
    description: string;
    media_url: string;
    permalink: string;
    timestamp: number;
}