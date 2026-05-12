import { useEffect, useMemo, useRef, useState } from 'react'
import { DocsTab } from '../features/api-client/components/DocsTab.jsx'
import { EndpointSidebar } from '../features/api-client/components/EndpointSidebar.jsx'
import { RequestTab } from '../features/api-client/components/RequestTab.jsx'
import { ResponseTab } from '../features/api-client/components/ResponseTab.jsx'
import { ThemeToggle } from '../features/api-client/components/ThemeToggle.jsx'
import { SAMPLE_SPEC } from '../features/api-client/constants/sampleSpec.js'
import {
  createDefaultDraft,
  extractEndpoints,
  getParamKey,
  parseSpecText,
} from '../features/api-client/lib/openapi.js'
import {
  buildRequest,
  formatBody,
  formatBytes,
} from '../features/api-client/lib/request.js'
import { hashText } from '../shared/utils/hash.js'
import { capitalize } from '../shared/utils/text.js'
import { applyTheme, getInitialTheme } from '../shared/utils/theme.js'
import '../features/api-client/styles/apiClient.css'

const TABS = ['request', 'docs', 'response']

export function ApiClientPage() {
  const fileInputRef = useRef(null)
  const [theme, setTheme] = useState(getInitialTheme)
  const [specText, setSpecText] = useState(SAMPLE_SPEC)
  const [fileName, setFileName] = useState('sample-openapi.yaml')
  const [selectedKey, setSelectedKey] = useState('')
  const [activeTag, setActiveTag] = useState('All')
  const [filter, setFilter] = useState('')
  const [activeTab, setActiveTab] = useState('request')
  const [baseUrl, setBaseUrl] = useState('')
  const [drafts, setDrafts] = useState({})
  const [authToken, setAuthToken] = useState('')
  const [response, setResponse] = useState(null)
  const [history, setHistory] = useState([])
  const [isSending, setIsSending] = useState(false)

  const parsed = useMemo(() => parseSpecText(specText), [specText])
  const endpoints = useMemo(
    () => (parsed.spec ? extractEndpoints(parsed.spec) : []),
    [parsed.spec],
  )
  const tags = useMemo(() => {
    const names = new Set()
    endpoints.forEach((endpoint) => {
      endpoint.tags.forEach((tag) => names.add(tag))
    })
    return ['All', ...Array.from(names).sort()]
  }, [endpoints])

  const effectiveSelectedKey = endpoints.some(
    (endpoint) => endpoint.key === selectedKey,
  )
    ? selectedKey
    : endpoints[0]?.key || ''

  const selectedEndpoint = useMemo(
    () =>
      endpoints.find((endpoint) => endpoint.key === effectiveSelectedKey) ||
      null,
    [effectiveSelectedKey, endpoints],
  )

  const filteredEndpoints = useMemo(() => {
    const needle = filter.trim().toLowerCase()
    return endpoints.filter((endpoint) => {
      const matchesTag =
        activeTag === 'All' || endpoint.tags.includes(activeTag)
      const matchesSearch =
        !needle ||
        `${endpoint.method} ${endpoint.path} ${endpoint.summary} ${endpoint.operationId}`
          .toLowerCase()
          .includes(needle)
      return matchesTag && matchesSearch
    })
  }, [activeTag, endpoints, filter])

  const specTitle = parsed.spec?.info?.title || 'Untitled API'
  const specVersion = parsed.spec?.info?.version || 'No version'
  const serverOptions = useMemo(
    () => (Array.isArray(parsed.spec?.servers) ? parsed.spec.servers : []),
    [parsed.spec],
  )
  const effectiveBaseUrl = baseUrl || serverOptions[0]?.url || ''
  const specSignature = useMemo(() => hashText(specText), [specText])
  const draftKey = selectedEndpoint
    ? `${specSignature}:${selectedEndpoint.key}`
    : ''
  const defaultDraft = useMemo(
    () => createDefaultDraft(selectedEndpoint, parsed.spec),
    [parsed.spec, selectedEndpoint],
  )
  const currentDraft = draftKey ? drafts[draftKey] || defaultDraft : defaultDraft

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  function handleFile(file) {
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setSpecText(String(reader.result || ''))
      setFileName(file.name)
      setActiveTag('All')
      setFilter('')
      setActiveTab('request')
      setSelectedKey('')
      setBaseUrl('')
      setDrafts({})
      setResponse(null)
    }
    reader.readAsText(file)
  }

  function handleDrop(event) {
    event.preventDefault()
    handleFile(event.dataTransfer.files?.[0])
  }

  function handleEndpointSelect(nextKey) {
    setSelectedKey(nextKey)
    setActiveTab('request')
  }

  function updateParam(parameter, value) {
    if (!draftKey) {
      return
    }

    setDrafts((current) => {
      const draft = current[draftKey] || defaultDraft
      return {
        ...current,
        [draftKey]: {
          ...draft,
          params: {
            ...draft.params,
            [getParamKey(parameter)]: value,
          },
        },
      }
    })
  }

  function updateDraftField(field, value) {
    if (!draftKey) {
      return
    }

    setDrafts((current) => {
      const draft = current[draftKey] || defaultDraft
      return {
        ...current,
        [draftKey]: {
          ...draft,
          [field]: value,
        },
      }
    })
  }

  function toggleTheme() {
    setTheme((currentTheme) =>
      currentTheme === 'dark' ? 'light' : 'dark',
    )
  }

  async function sendRequest() {
    if (!selectedEndpoint) {
      return
    }

    setIsSending(true)
    const startedAt = performance.now()

    try {
      const request = buildRequest({
        endpoint: selectedEndpoint,
        baseUrl: effectiveBaseUrl,
        paramValues: currentDraft.params,
        headersText: currentDraft.headersText,
        authToken,
        bodyText: currentDraft.bodyText,
      })

      const fetchResponse = await fetch(request.url, request.options)
      const text = await fetchResponse.text()
      const finishedAt = performance.now()
      const headers = Array.from(fetchResponse.headers.entries()).map(
        ([name, value]) => ({ name, value }),
      )
      const nextResponse = {
        ok: fetchResponse.ok,
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        url: fetchResponse.url,
        method: selectedEndpoint.method,
        endpoint: selectedEndpoint.path,
        time: Math.max(1, Math.round(finishedAt - startedAt)),
        size: formatBytes(new Blob([text]).size),
        body: formatBody(text),
        rawBody: text,
        headers,
        sentAt: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      }

      setResponse(nextResponse)
      setHistory((current) => [nextResponse, ...current].slice(0, 8))
      setActiveTab('response')
    } catch (error) {
      const finishedAt = performance.now()
      const nextResponse = {
        ok: false,
        status: 'ERR',
        statusText: 'Request failed',
        url: '',
        method: selectedEndpoint.method,
        endpoint: selectedEndpoint.path,
        time: Math.max(1, Math.round(finishedAt - startedAt)),
        size: '0 B',
        body:
          error instanceof Error
            ? error.message
            : 'The request could not be completed.',
        rawBody: '',
        headers: [],
        sentAt: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      }

      setResponse(nextResponse)
      setHistory((current) => [nextResponse, ...current].slice(0, 8))
      setActiveTab('response')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">API client</p>
          <h1>{specTitle}</h1>
        </div>
        <div className="topbar-actions">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <div className="topbar-meta">
            <span>{specVersion}</span>
            <span>{endpoints.length} endpoints</span>
          </div>
        </div>
      </header>

      <section className="workspace">
        <EndpointSidebar
          activeTag={activeTag}
          endpointCount={endpoints.length}
          fileInputRef={fileInputRef}
          fileName={fileName}
          filter={filter}
          filteredEndpoints={filteredEndpoints}
          onDrop={handleDrop}
          onFileSelected={handleFile}
          onSelectEndpoint={handleEndpointSelect}
          onSpecTextChange={setSpecText}
          parseError={parsed.error}
          selectedKey={effectiveSelectedKey}
          setActiveTag={setActiveTag}
          setFilter={setFilter}
          specText={specText}
          tags={tags}
        />

        <section className="request-panel">
          {selectedEndpoint ? (
            <>
              <div className="endpoint-header">
                <div>
                  <div className="endpoint-title-line">
                    <span
                      className={`method-badge large ${selectedEndpoint.methodClass}`}
                    >
                      {selectedEndpoint.method}
                    </span>
                    <code>{selectedEndpoint.path}</code>
                  </div>
                  <h2>{selectedEndpoint.summary || selectedEndpoint.path}</h2>
                  {selectedEndpoint.description && (
                    <p>{selectedEndpoint.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  className="primary-button"
                  onClick={sendRequest}
                  disabled={isSending}
                >
                  {isSending ? 'Sending' : 'Send request'}
                </button>
              </div>

              <div className="tabs" role="tablist" aria-label="Endpoint tools">
                {TABS.map((tab) => (
                  <button
                    type="button"
                    role="tab"
                    key={tab}
                    className={tab === activeTab ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab(tab)}
                  >
                    {capitalize(tab)}
                  </button>
                ))}
              </div>

              {activeTab === 'request' && (
                <RequestTab
                  authToken={authToken}
                  baseUrl={effectiveBaseUrl}
                  bodyText={currentDraft.bodyText}
                  endpoint={selectedEndpoint}
                  headersText={currentDraft.headersText}
                  paramValues={currentDraft.params}
                  serverOptions={serverOptions}
                  setAuthToken={setAuthToken}
                  setBaseUrl={setBaseUrl}
                  setBodyText={(value) => updateDraftField('bodyText', value)}
                  setHeadersText={(value) =>
                    updateDraftField('headersText', value)
                  }
                  updateParam={updateParam}
                />
              )}

              {activeTab === 'docs' && (
                <DocsTab endpoint={selectedEndpoint} spec={parsed.spec} />
              )}

              {activeTab === 'response' && (
                <ResponseTab response={response} history={history} />
              )}
            </>
          ) : (
            <div className="empty-workspace">
              <h2>Load an OpenAPI file</h2>
              <p>YAML and JSON documents are accepted.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}
