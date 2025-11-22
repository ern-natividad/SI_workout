export const excerciseOptions = {
    method: 'GET'
};

const API_BASE = import.meta.env.VITE_API_BASE || '';

export const fetchData = async (url, options) => {
    const fullUrl = url && url.startsWith('/') ? API_BASE + url : url;
    const response = await fetch(fullUrl, options);
    return await response.json();
}