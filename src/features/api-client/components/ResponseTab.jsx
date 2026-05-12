export function ResponseTab({ history, response }) {
  return (
    <div className="tab-content response-layout">
      <section className="response-viewer">
        {response ? (
          <>
            <div className="response-summary">
              <span className={response.ok ? 'status ok' : 'status error'}>
                {response.status} {response.statusText}
              </span>
              <span>{response.time} ms</span>
              <span>{response.size}</span>
            </div>
            {response.url && <p className="response-url">{response.url}</p>}
            <pre>{response.body}</pre>
            {response.headers.length > 0 && (
              <details className="response-headers">
                <summary>Headers</summary>
                {response.headers.map((header) => (
                  <div key={header.name}>
                    <strong>{header.name}</strong>
                    <span>{header.value}</span>
                  </div>
                ))}
              </details>
            )}
          </>
        ) : (
          <div className="empty-response">
            <h3>No response yet</h3>
            <p>
              Send the selected request to capture status, timing, headers, and
              body.
            </p>
          </div>
        )}
      </section>

      <aside className="history-panel">
        <div className="section-heading">
          <h3>History</h3>
          <span>{history.length}</span>
        </div>
        {history.map((entry, index) => (
          <div className="history-item" key={`${entry.sentAt}-${index}`}>
            <span className={entry.ok ? 'history-status ok' : 'history-status error'}>
              {entry.status}
            </span>
            <strong>
              {entry.method} {entry.endpoint}
            </strong>
            <small>
              {entry.sentAt} - {entry.time} ms
            </small>
          </div>
        ))}
        {!history.length && <p className="muted">No calls recorded.</p>}
      </aside>
    </div>
  )
}
