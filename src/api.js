//src/api.js
export const CLIENT_ID = 'K6HLHwT0DgSPJpHiuvkrh5pJG7yrcGV7KKHafIpOc-s';

export async function fetchUnsplashImages(query, page = 1) {
    const perPage = 12;
    const url = `https://api.unsplash.com/search/photos?page=${page}&per_page=${perPage}&query=${encodeURIComponent(query)}&client_id=${CLIENT_ID}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Client-ID ${CLIENT_ID}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`);
    }

    return await response.json();
}