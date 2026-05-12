import { Component } from 'react'

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <main className="app-fallback" role="alert">
          <div>
            <p>Something went wrong while reading this API document.</p>
            <button type="button" onClick={() => window.location.reload()}>
              Reload client
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
