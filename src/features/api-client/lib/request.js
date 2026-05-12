import { getParamKey } from './openapi.js'

export function buildRequest({
  authToken,
  baseUrl,
  bodyText,
  endpoint,
  headersText,
  paramValues,
}) {
  if (!baseUrl.trim()) {
    throw new Error('Add a server URL before sending the request.')
  }

  const resolvedPath = endpoint.path.replace(/\{([^}]+)\}/g, (_, name) => {
    const value = paramValues[`path:${name}`]
    if (!value && value !== 0) {
      throw new Error(`Missing path value: ${name}`)
    }
    return encodeURIComponent(String(value))
  })
  const url = new URL(
    `${baseUrl.replace(/\/$/, '')}/${resolvedPath.replace(/^\//, '')}`,
  )

  endpoint.parameters
    .filter((parameter) => parameter.in === 'query')
    .forEach((parameter) => {
      const value = paramValues[getParamKey(parameter)]
      if (value !== undefined && String(value).trim() !== '') {
        url.searchParams.set(parameter.name, value)
      }
    })

  const headers = parseHeaders(headersText)
  endpoint.parameters
    .filter((parameter) => parameter.in === 'header')
    .forEach((parameter) => {
      const value = paramValues[getParamKey(parameter)]
      if (value !== undefined && String(value).trim() !== '') {
        headers.set(parameter.name, value)
      }
    })

  if (authToken.trim()) {
    headers.set('Authorization', `Bearer ${authToken.trim()}`)
  }

  const options = {
    method: endpoint.method,
    headers,
  }

  if (!['GET', 'HEAD'].includes(endpoint.method) && bodyText.trim()) {
    options.body = bodyText
  }

  return { url: url.toString(), options }
}

export function formatBody(text) {
  if (!text) {
    return ''
  }
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return text
  }
}

export function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function parseHeaders(text) {
  const headers = new Headers()
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const separator = line.indexOf(':')
      if (separator > -1) {
        const name = line.slice(0, separator).trim()
        const value = line.slice(separator + 1).trim()
        if (name && value) {
          headers.set(name, value)
        }
      }
    })
  return headers
}
