const TOKEN_KEY = 'lxpToken'

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY) || ''

export const normalizeBearerToken = (token) => {
  const trimmedToken = `${token || ''}`.trim()

  if (!trimmedToken) {
    return ''
  }

  return trimmedToken.replace(/^Bearer\s+/i, '')
}

export const getAuthorizationToken = (storeToken) => {
  const latestToken = getStoredToken() || storeToken

  return normalizeBearerToken(latestToken)
}

export const applyAuthHeaders = (config, storeToken) => {
  const token = getAuthorizationToken(storeToken)

  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
    config.headers.platform = 'leapx'
  }

  config.authToken = token

  return config
}

export const waitForTokenChange = (requestToken) => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const currentToken = getStoredToken()
      if (currentToken && currentToken !== requestToken) {
        clearInterval(interval)
        resolve(currentToken)
      }
    }, 500)
  })
}
