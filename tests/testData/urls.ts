const BASE_URL = 'http://localhost:3000';

export const appUrls = {
    home: `${BASE_URL}/`,
    search: `${BASE_URL}/search`,
    admin: `${BASE_URL}/admin`,
    adminLogin: `${BASE_URL}/admin/login`,
    item: (id: number | string) => `${BASE_URL}/items/${id}`,
    calendar: (id: number | string) => `${BASE_URL}/calendar/${id}`,
};
