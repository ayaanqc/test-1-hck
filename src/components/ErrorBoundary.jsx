import { Component } from 'react'

// Last line of defence: if any screen throws, show what happened instead of a
// blank white page. No i18n here on purpose — this must work even when the
// provider or the store is the thing that broke.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Keep the details in the console for whoever is debugging the demo.
    console.error('Jawabdehi screen error', error, info)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    const message = String((error && error.message) || error || 'Unknown error')
    return (
      <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 p-6">
        <p className="label-caps">Jawabdehi</p>
        <h1 className="text-2xl font-semibold text-ink">
          This screen could not load
        </h1>
        <p className="text-base text-ink-600">
          यह स्क्रीन नहीं खुल सकी। नीचे दिया गया बटन दबाकर फिर कोशिश करें।
        </p>
        <div className="card p-4">
          <p className="label-caps">Error</p>
          <p className="mt-1 break-words font-mono text-sm text-ink-600">{message}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="inline-flex min-h-[48px] items-center rounded-full bg-ink px-5 py-2 text-base font-semibold text-white"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-[48px] items-center rounded-full border border-line-strong bg-white px-5 py-2 text-base font-semibold text-ink"
          >
            Reload the page
          </button>
        </div>
        <p className="text-sm text-ink-500">
          If you are in danger right now, call 112.
        </p>
      </div>
    )
  }
}
