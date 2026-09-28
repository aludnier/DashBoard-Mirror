import { useEffect, useState } from 'react'
import axios from 'axios'
import { getUserSession } from '../client'
import { fetchWidgetData } from './api'
import type { WidgetData, WidgetInstance } from './types'

interface WidgetContentProps {
  instance: WidgetInstance
}

// The server answers errors as { statusCode, message }; show its message
// ("Connect your github account first", ...) when there is one.
function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string')
    return error.response.data.message
  return 'Could not load this widget.'
}

function WidgetContent({ instance }: WidgetContentProps) {
  const [data, setData] = useState<WidgetData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const userId = getUserSession()?.id
  const { id: instanceId, refreshRateSeconds } = instance

  // Load now, then again every refreshRateSeconds, until the card unmounts.
  useEffect(() => {
    if (!userId) return
    let cancelled = false

    // An arrow function, not `function load()`: TypeScript only keeps the
    // `userId` null check inside closures that aren't hoisted.
    const load = () => {
      fetchWidgetData(userId, instanceId)
        .then((result) => {
          if (cancelled) return
          setData(result)
          setError(null)
        })
        .catch((err) => {
          if (!cancelled) setError(errorMessage(err))
        })
    }

    load()
    const timer = setInterval(load, refreshRateSeconds * 1000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [userId, instanceId, refreshRateSeconds])

  // A failed refresh keeps showing the last good data instead of an error.
  if (error && !data)
    return <p className="widget-content-error">{error}</p>

  if (!data)
    return <p>Loading...</p>

  if (data.items.length === 0)
    return <p>Nothing to show.</p>

  return (
    <ul className="widget-list">
      {data.items.map((item) => (
        <li key={item.id} className="widget-list-item">
          {item.url ? (
            <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
          ) : (
            <span>{item.title}</span>
          )}
          {item.subtitle && <span className="widget-list-subtitle">{item.subtitle}</span>}
        </li>
      ))}
    </ul>
  )
}

export default WidgetContent
