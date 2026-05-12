export function EndpointSidebar({
  activeTag,
  endpointCount,
  fileInputRef,
  fileName,
  filter,
  filteredEndpoints,
  onDrop,
  onFileSelected,
  onSelectEndpoint,
  onSpecTextChange,
  parseError,
  selectedKey,
  setActiveTag,
  setFilter,
  specText,
  tags,
}) {
  return (
    <aside className="sidebar" aria-label="API navigation">
      <div
        className="upload-zone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
      >
        <input
          ref={fileInputRef}
          className="visually-hidden"
          type="file"
          accept=".yaml,.yml,.json,application/json,text/yaml,text/x-yaml"
          onChange={(event) => onFileSelected(event.target.files?.[0])}
        />
        <button
          type="button"
          className="secondary-button full-width"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload YAML or JSON
        </button>
        <p className="file-name">{fileName}</p>
      </div>

      <label className="field-label" htmlFor="spec-text">
        OpenAPI source
      </label>
      <textarea
        id="spec-text"
        className="spec-editor"
        value={specText}
        spellCheck="false"
        onChange={(event) => onSpecTextChange(event.target.value)}
      />

      {parseError && (
        <div className="parse-error" role="alert">
          {parseError}
        </div>
      )}

      <div className="search-row">
        <label className="visually-hidden" htmlFor="endpoint-search">
          Search endpoints
        </label>
        <input
          id="endpoint-search"
          type="search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder={`Search ${endpointCount} endpoints`}
        />
      </div>

      <div className="tag-strip" aria-label="Tags">
        {tags.map((tag) => (
          <button
            type="button"
            key={tag}
            className={tag === activeTag ? 'tag-pill active' : 'tag-pill'}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <nav className="endpoint-list" aria-label="Endpoints">
        {filteredEndpoints.map((endpoint) => (
          <button
            type="button"
            key={endpoint.key}
            className={
              endpoint.key === selectedKey
                ? 'endpoint-item selected'
                : 'endpoint-item'
            }
            onClick={() => onSelectEndpoint(endpoint.key)}
          >
            <span className={`method-badge ${endpoint.methodClass}`}>
              {endpoint.method}
            </span>
            <span className="endpoint-copy">
              <strong>{endpoint.summary || endpoint.path}</strong>
              <small>{endpoint.path}</small>
            </span>
          </button>
        ))}
        {!filteredEndpoints.length && (
          <p className="empty-state">No endpoints found.</p>
        )}
      </nav>
    </aside>
  )
}
