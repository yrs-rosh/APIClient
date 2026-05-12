import { parseYaml } from './yaml.js'

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

export function parseSpecText(text) {
  const trimmed = text.trim()
  if (!trimmed) {
    return { spec: null, error: 'The OpenAPI source is empty.' }
  }

  try {
    return { spec: JSON.parse(trimmed), error: '' }
  } catch {
    try {
      return { spec: parseYaml(trimmed), error: '' }
    } catch (error) {
      return {
        spec: null,
        error:
          error instanceof Error
            ? error.message
            : 'The OpenAPI source could not be parsed.',
      }
    }
  }
}

export function extractEndpoints(spec) {
  const paths = spec?.paths || {}
  const endpoints = []

  Object.entries(paths).forEach(([path, pathItem]) => {
    if (!pathItem || typeof pathItem !== 'object') {
      return
    }

    HTTP_METHODS.forEach((method) => {
      const operation = pathItem[method]
      if (!operation || typeof operation !== 'object') {
        return
      }

      const parameters = [
        ...normalizeArray(pathItem.parameters),
        ...normalizeArray(operation.parameters),
      ]

      endpoints.push({
        ...operation,
        key: `${method.toUpperCase()} ${path}`,
        method: method.toUpperCase(),
        methodClass: method.toLowerCase(),
        path,
        parameters,
        requestBody: operation.requestBody,
        responses: operation.responses || {},
        summary: operation.summary || operation.operationId || path,
        description: operation.description || '',
        operationId: operation.operationId || '',
        tags: normalizeArray(operation.tags).length
          ? normalizeArray(operation.tags)
          : ['General'],
      })
    })
  })

  return endpoints
}

export function createDefaultDraft(endpoint, spec) {
  if (!endpoint) {
    return {
      params: {},
      headersText: 'Accept: application/json',
      bodyText: '',
    }
  }

  const params = {}
  endpoint.parameters.forEach((parameter) => {
    params[getParamKey(parameter)] = getParameterDefault(parameter)
  })

  return {
    params,
    headersText: createHeaderTemplate(endpoint),
    bodyText: createBodyTemplate(endpoint, spec),
  }
}

export function getParamKey(parameter) {
  return `${parameter.in || 'query'}:${parameter.name}`
}

export function getPrimaryContentType(endpoint) {
  return getPrimaryContent(endpoint)?.[0] || 'Body'
}

export function resolveSchema(schema, spec, seen = new Set()) {
  if (!schema || typeof schema !== 'object') {
    return schema
  }
  if (!schema.$ref) {
    return schema
  }
  if (seen.has(schema.$ref)) {
    return schema
  }

  seen.add(schema.$ref)
  const path = schema.$ref.replace(/^#\//, '').split('/')
  const resolved = path.reduce(
    (current, key) => current?.[key.replace(/~1/g, '/').replace(/~0/g, '~')],
    spec,
  )
  return resolveSchema(resolved || schema, spec, seen)
}

export function schemaLabel(schema, spec) {
  if (!schema) {
    return 'value'
  }
  if (schema.$ref) {
    return schema.$ref.split('/').pop()
  }

  const resolved = resolveSchema(schema, spec)
  if (!resolved || typeof resolved !== 'object') {
    return 'value'
  }
  if (resolved.type === 'array' || resolved.items) {
    return `array<${schemaLabel(resolved.items, spec)}>`
  }
  if (resolved.type === 'object' || resolved.properties) {
    const names = Object.keys(resolved.properties || {})
    return names.length ? `object { ${names.slice(0, 4).join(', ')} }` : 'object'
  }
  return resolved.format
    ? `${resolved.type || 'string'}:${resolved.format}`
    : resolved.type || 'value'
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

function getParameterDefault(parameter) {
  if (parameter.example !== undefined) {
    return String(parameter.example)
  }
  if (parameter.schema?.example !== undefined) {
    return String(parameter.schema.example)
  }
  if (parameter.schema?.default !== undefined) {
    return String(parameter.schema.default)
  }
  return ''
}

function getPrimaryContent(endpoint) {
  const content = endpoint.requestBody?.content
  if (!content) {
    return null
  }

  const entries = Object.entries(content)
  return (
    entries.find(([contentType]) => contentType.includes('json')) ||
    entries[0] ||
    null
  )
}

function createHeaderTemplate(endpoint) {
  const contentType = getPrimaryContentType(endpoint)
  const headers = ['Accept: application/json']
  if (endpoint.requestBody && contentType) {
    headers.push(`Content-Type: ${contentType}`)
  }
  return headers.join('\n')
}

function createBodyTemplate(endpoint, spec) {
  const primaryContent = getPrimaryContent(endpoint)
  if (!primaryContent) {
    return ''
  }

  const [, media] = primaryContent
  const example =
    media.example ??
    Object.values(media.examples || {})[0]?.value ??
    schemaToExample(media.schema, spec)

  if (typeof example === 'string') {
    return example
  }
  return JSON.stringify(example, null, 2)
}

function schemaToExample(schema, spec, seen = new Set()) {
  const resolved = resolveSchema(schema, spec, seen)
  if (!resolved || typeof resolved !== 'object') {
    return {}
  }
  if (resolved.example !== undefined) {
    return resolved.example
  }
  if (resolved.default !== undefined) {
    return resolved.default
  }
  if (resolved.enum?.length) {
    return resolved.enum[0]
  }
  if (resolved.oneOf?.length || resolved.anyOf?.length) {
    return schemaToExample((resolved.oneOf || resolved.anyOf)[0], spec, seen)
  }
  if (resolved.allOf?.length) {
    return resolved.allOf.reduce((object, item) => {
      const example = schemaToExample(item, spec, seen)
      return typeof example === 'object' && !Array.isArray(example)
        ? { ...object, ...example }
        : object
    }, {})
  }

  if (resolved.type === 'array' || resolved.items) {
    return [schemaToExample(resolved.items || {}, spec, seen)]
  }

  if (resolved.type === 'object' || resolved.properties) {
    return Object.entries(resolved.properties || {}).reduce(
      (object, [name, property]) => ({
        ...object,
        [name]: schemaToExample(property, spec, seen),
      }),
      {},
    )
  }

  if (resolved.type === 'integer' || resolved.type === 'number') {
    return resolved.type === 'integer' ? 1 : 1.1
  }
  if (resolved.type === 'boolean') {
    return true
  }
  if (resolved.format === 'date-time') {
    return '2026-05-12T09:00:00.000Z'
  }
  if (resolved.format === 'date') {
    return '2026-05-12'
  }
  if (resolved.format === 'email') {
    return 'name@example.com'
  }
  if (resolved.format === 'uuid') {
    return '00000000-0000-4000-8000-000000000000'
  }
  return 'string'
}
