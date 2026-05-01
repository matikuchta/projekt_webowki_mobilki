import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

const backendBaseUrl = import.meta.env.VITE_API_URL ?? ''

type VolleyballStatusResponse = {
  response?: {
    account?: {
      firstname?: string
      lastname?: string
      email?: string
    }
    subscription?: {
      plan?: string
      end?: string
      active?: boolean
    }
    requests?: {
      current?: number
      limit_day?: number
    }
  }
  message?: string
}

type VolleyballLeague = {
  country?: {
    name?: string
  }
  league?: {
    id?: number
    name?: string
    type?: string
  }
  seasons?: Array<{
    year?: number
    current?: boolean
  }>
}

type VolleyballLeaguesResponse = {
  response?: VolleyballLeague[]
  results?: number
  message?: string
}

function App() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [message, setMessage] = useState('')
  const [volleyballCountry, setVolleyballCountry] = useState('Poland')
  const [volleyballSeason, setVolleyballSeason] = useState('')
  const [volleyballSearch, setVolleyballSearch] = useState('')
  const [volleyballMessage, setVolleyballMessage] = useState('')
  const [volleyballStatus, setVolleyballStatus] = useState<VolleyballStatusResponse['response'] | null>(null)
  const [volleyballLeagues, setVolleyballLeagues] = useState<VolleyballLeague[]>([])
  const [isStatusLoading, setIsStatusLoading] = useState(false)
  const [isLeaguesLoading, setIsLeaguesLoading] = useState(false)

  async function readJson(response: Response) {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message ?? 'Request failed')
    }

    return data
  }

  async function handleRegister() {
    if (password !== repeatPassword) {
      setMessage('Passwords do not match')
      return
    }

    setMessage('Registering...')

    try {
      const response = await fetch(`${backendBaseUrl}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      })

      const data = await readJson(response)
      setMessage(data.message)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Backend is not running')
    }
  }

  async function handleLogin() {
    setMessage('Logging in...')

    try {
      const response = await fetch(`${backendBaseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      })

      const data = await readJson(response)
      setMessage(data.message)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Backend is not running')
    }
  }

  async function handleVolleyballStatus() {
    setIsStatusLoading(true)
    setVolleyballMessage('Checking Volleyball API status...')

    try {
      const response = await fetch(`${backendBaseUrl}/api/volleyball/status`)
      const data = (await readJson(response)) as VolleyballStatusResponse

      setVolleyballStatus(data.response ?? null)
      setVolleyballMessage('Volleyball API status loaded')
    } catch (error) {
      setVolleyballMessage(
        error instanceof Error ? error.message : 'Could not reach the backend',
      )
    } finally {
      setIsStatusLoading(false)
    }
  }

  async function handleVolleyballLeagues() {
    setIsLeaguesLoading(true)
    setVolleyballMessage('Loading leagues from API-SPORTS...')

    const params = new URLSearchParams()

    if (volleyballCountry.trim()) {
      params.set('country', volleyballCountry.trim())
    }

    if (volleyballSeason.trim()) {
      params.set('season', volleyballSeason.trim())
    }

    if (volleyballSearch.trim()) {
      params.set('search', volleyballSearch.trim())
    }

    try {
      const response = await fetch(
        `${backendBaseUrl}/api/volleyball/leagues?${params.toString()}`,
      )
      const data = (await readJson(response)) as VolleyballLeaguesResponse

      setVolleyballLeagues(data.response ?? [])
      setVolleyballMessage(`Loaded ${data.results ?? data.response?.length ?? 0} leagues`)
    } catch (error) {
      setVolleyballLeagues([])
      setVolleyballMessage(
        error instanceof Error ? error.message : 'Could not reach the backend',
      )
    } finally {
      setIsLeaguesLoading(false)
    }
  }

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Backend + Volleyball API</h1>
          <p>Basic auth plus a server-side connection to API-SPORTS Volleyball.</p>
        </div>
        <div className="auth-form">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            type="password"
          />
          <input
            value={repeatPassword}
            onChange={(event) => setRepeatPassword(event.target.value)}
            placeholder="Repeat password"
            type="password"
          />
          <button className="counter" onClick={handleRegister}>
            Register
          </button>
          <button className="counter" onClick={handleLogin}>
            Login
          </button>
          {message && <p>{message}</p>}
        </div>

      </section>
      <div className="ticks"></div>

      <section id="next-steps" className="api-panel">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Volleyball status</h2>
          <p>Checks whether your backend can reach API-SPORTS using the configured key.</p>
          <div className="api-toolbar">
            <button className="counter" onClick={handleVolleyballStatus} disabled={isStatusLoading}>
              {isStatusLoading ? 'Checking...' : 'Load status'}
            </button>
          </div>
          {volleyballStatus && (
            <div className="api-result">
              <p>
                Plan: <code>{volleyballStatus.subscription?.plan ?? 'unknown'}</code>
              </p>
              <p>
                Daily usage: <code>{volleyballStatus.requests?.current ?? 0}</code> /{' '}
                <code>{volleyballStatus.requests?.limit_day ?? 0}</code>
              </p>
            </div>
          )}
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Leagues lookup</h2>
          <p>Queries the Volleyball API through your backend, keeping the API key off the client.</p>
          <div className="auth-form volleyball-form">
            <input
              value={volleyballCountry}
              onChange={(event) => setVolleyballCountry(event.target.value)}
              placeholder="Country, e.g. Poland"
            />
            <input
              value={volleyballSeason}
              onChange={(event) => setVolleyballSeason(event.target.value)}
              placeholder="Season, e.g. 2024"
            />
            <input
              value={volleyballSearch}
              onChange={(event) => setVolleyballSearch(event.target.value)}
              placeholder="Search by league name"
            />
            <button className="counter" onClick={handleVolleyballLeagues} disabled={isLeaguesLoading}>
              {isLeaguesLoading ? 'Loading...' : 'Load leagues'}
            </button>
          </div>
          <div className="api-result">
            {volleyballMessage && <p>{volleyballMessage}</p>}
            {volleyballLeagues.length > 0 && (
              <ul className="league-list">
                {volleyballLeagues.slice(0, 8).map((item) => {
                  const currentSeason = item.seasons?.find((season) => season.current)
                  const fallbackSeason = item.seasons?.[0]

                  return (
                    <li key={`${item.league?.id ?? 'league'}-${item.league?.name ?? 'unknown'}`}>
                      <strong>{item.league?.name ?? 'Unknown league'}</strong>
                      <span>{item.country?.name ?? 'Unknown country'}</span>
                      <span>
                        {item.league?.type ?? 'League'} | season{' '}
                        {currentSeason?.year ?? fallbackSeason?.year ?? 'n/a'}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
