export interface User {
    id: string;
    email: string;
    username: string;
    password: string;
    profile_picture?: string;
    wishlist?: string[];
    categories?: string[];
    location: string;
}
