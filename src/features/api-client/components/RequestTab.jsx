import { getPrimaryContentType } from '../lib/openapi.js'
import { ParamSection } from './ParamSection.jsx'

export function RequestTab({
  authToken,
  baseUrl,
  bodyText,
  endpoint,
  headersText,
  paramValues,
  serverOptions,
  setAuthToken,
  setBaseUrl,
  setBodyText,
  setHeadersText,
  updateParam,
}) {
  const pathParams = endpoint.parameters.filter(
    (parameter) => parameter.in === 'path',
  )
  const queryParams = endpoint.parameters.filter(
    (parameter) => parameter.in === 'query',
  )
  const headerParams = endpoint.parameters.filter(
    (parameter) => parameter.in === 'header',
  )
  const hasBody = Boolean(endpoint.requestBody)

  return (
    <div className="tab-content request-grid">
      <section className="form-section wide">
        <div className="section-heading">
          <h3>Server</h3>
        </div>
        <div className="server-row">
          <input
            type="url"
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
            placeholder="https://api.example.com"
          />
          {serverOptions.length > 0 && (
            <select
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              aria-label="Saved servers"
            >
              {serverOptions.map((server) => (
                <option key={server.url} value={server.url}>
                  {server.description || server.url}
                </option>
              ))}
            </select>
          )}
        </div>
      </section>

      <ParamSection
        title="Path"
        emptyText="No path parameters."
        parameters={pathParams}
        values={paramValues}
        updateParam={updateParam}
      />
      <ParamSection
        title="Query"
        emptyText="No query parameters."
        parameters={queryParams}
        values={paramValues}
        updateParam={updateParam}
      />
      <ParamSection
        title="Headers"
        emptyText="No documented header parameters."
        parameters={headerParams}
        values={paramValues}
        updateParam={updateParam}
      />

      <section className="form-section">
        <div className="section-heading">
          <h3>Custom Headers</h3>
        </div>
        <textarea
          className="headers-editor"
          value={headersText}
          spellCheck="false"
          onChange={(event) => setHeadersText(event.target.value)}
          placeholder="Accept: application/json"
        />
      </section>

      <section className="form-section">
        <div className="section-heading">
          <h3>Authorization</h3>
        </div>
        <input
          type="password"
          value={authToken}
          onChange={(event) => setAuthToken(event.target.value)}
          placeholder="Bearer token"
        />
      </section>

      <section className="form-section wide">
        <div className="section-heading">
          <h3>Payload</h3>
          <span>{hasBody ? getPrimaryContentType(endpoint) : 'No body'}</span>
        </div>
        <textarea
          className="body-editor"
          value={bodyText}
          spellCheck="false"
          onChange={(event) => setBodyText(event.target.value)}
          placeholder={hasBody ? '{\n  "name": "value"\n}' : ''}
          disabled={!hasBody}
        />
      </section>
    </div>
  )
}
