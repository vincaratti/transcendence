let authToken = null 

export function setAuthToken(token) { 
  authToken = token // set once and forget
}


export async function apiFetch(path, options = {}) {
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${authToken}`
    }
  })
}