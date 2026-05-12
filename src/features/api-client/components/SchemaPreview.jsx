import { resolveSchema, schemaLabel } from '../lib/openapi.js'

export function SchemaPreview({ schema, spec, title }) {
  const resolved = resolveSchema(schema, spec)
  const properties = resolved?.properties ? Object.entries(resolved.properties) : []

  return (
    <div className="schema-preview">
      <strong>{title}</strong>
      <span>{schemaLabel(schema, spec)}</span>
      {properties.length > 0 && (
        <ul>
          {properties.slice(0, 8).map(([name, property]) => (
            <li key={name}>
              <code>{name}</code>
              <small>{schemaLabel(property, spec)}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
