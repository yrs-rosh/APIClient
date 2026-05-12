import { getParamKey, schemaLabel } from '../lib/openapi.js'
import { SchemaPreview } from './SchemaPreview.jsx'

export function DocsTab({ endpoint, spec }) {
  const responses = Object.entries(endpoint.responses || {})
  const schemas = Object.entries(spec?.components?.schemas || {})

  return (
    <div className="tab-content docs-grid">
      <section className="doc-section">
        <div className="section-heading">
          <h3>Operation</h3>
        </div>
        <dl className="doc-list">
          <div>
            <dt>Operation ID</dt>
            <dd>{endpoint.operationId || 'Not provided'}</dd>
          </div>
          <div>
            <dt>Tags</dt>
            <dd>{endpoint.tags.join(', ') || 'None'}</dd>
          </div>
          <div>
            <dt>Description</dt>
            <dd>{endpoint.description || endpoint.summary || 'Not provided'}</dd>
          </div>
        </dl>
      </section>

      <section className="doc-section">
        <div className="section-heading">
          <h3>Parameters</h3>
        </div>
        <div className="doc-table">
          {endpoint.parameters.map((parameter) => (
            <div className="doc-row" key={getParamKey(parameter)}>
              <strong>{parameter.name}</strong>
              <span>{parameter.in}</span>
              <span>{parameter.required ? 'Required' : 'Optional'}</span>
              <small>{parameter.description || schemaLabel(parameter.schema)}</small>
            </div>
          ))}
          {!endpoint.parameters.length && (
            <p className="muted">No parameters documented.</p>
          )}
        </div>
      </section>

      <section className="doc-section">
        <div className="section-heading">
          <h3>Request Body</h3>
        </div>
        {endpoint.requestBody ? (
          <div className="schema-list">
            {Object.entries(endpoint.requestBody.content || {}).map(
              ([contentType, media]) => (
                <SchemaPreview
                  key={contentType}
                  title={contentType}
                  schema={media.schema}
                  spec={spec}
                />
              ),
            )}
          </div>
        ) : (
          <p className="muted">No request body documented.</p>
        )}
      </section>

      <section className="doc-section">
        <div className="section-heading">
          <h3>Responses</h3>
        </div>
        <div className="response-docs">
          {responses.map(([status, response]) => (
            <div className="response-doc" key={status}>
              <strong>{status}</strong>
              <span>{response.description || 'No description'}</span>
              {Object.entries(response.content || {}).map(([contentType, media]) => (
                <small key={contentType}>
                  {contentType}: {schemaLabel(media.schema, spec)}
                </small>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="doc-section wide">
        <div className="section-heading">
          <h3>Schema Library</h3>
          <span>{schemas.length}</span>
        </div>
        <div className="schema-library">
          {schemas.map(([name, schema]) => (
            <SchemaPreview key={name} title={name} schema={schema} spec={spec} />
          ))}
          {!schemas.length && <p className="muted">No reusable schemas.</p>}
        </div>
      </section>
    </div>
  )
}
