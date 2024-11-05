const API_URL = '/api';


interface FetchOptions extends RequestInit {
  body?: string;
}

export async function fetchApi<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  const url = endpoint.startsWith('/') ? `${API_URL}${endpoint}` : `${API_URL}/${endpoint}`;

  console.log('Fetching:', url);

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}
