import { useEffect, useState } from 'react'
import { apiErrorMessage, getUserSession } from '../client'
import { fetchWidgetData } from './api'
import type { WidgetData, WidgetDataList, WidgetInstance } from './types'

interface WidgetContentProps {
  instance: WidgetInstance
}

function WidgetContent({ instance }: WidgetContentProps) {
  const [data, setData] = useState<WidgetDataList | null>(null)
  const [error, setError] = useState<string | null>(null)
  const userId = getUserSession()?.id
  const { id: instanceId, refreshRateSeconds } = instance

  // Load now, then again every refreshRateSeconds, until the card unmounts.
  useEffect(() => {
    if (!userId) return
    let cancelled = false

    const load = () => {
      fetchWidgetData(userId, instanceId)
        .then((result) => {
          if (cancelled) return
          if (result.kind === 'list' || result.kind === 'playlists') {
            setData(result)
            setError(null)
            return
          }
          throw new Error('Unexpected widget payload')
        })
        .catch((err) => {
          if (!cancelled) setError(apiErrorMessage(err, 'Could not load this widget.'))
        })
    }

    load()
    const timer = setInterval(load, refreshRateSeconds * 1000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [userId, instanceId, refreshRateSeconds])

  if (error && !data)
    return <p className="widget-content-error">{error}</p>

  if (!data)
    return <p>Loading...</p>

  if (data.kind === 'list') {
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

  if (data.playlists.length === 0)
    return <p>Nothing to show.</p>

  return (
    <div className="widget-playlists">
      {data.playlists.map((playlist) => (
        <div key={playlist.id} className="widget-playlist-item">
          <a href={`https://www.youtube.com/playlist?list=${playlist.id}`} target="_blank" rel="noreferrer">
            {playlist.thumbnailUrl && (
              <img src={playlist.thumbnailUrl} alt={playlist.title} className="widget-playlist-thumb" />
            )}
            <span>{playlist.title}</span>
          </a>
          {playlist.description && <p className="widget-playlist-description">{playlist.description}</p>}
        </div>
      ))}
    </div>
  )
}

export default WidgetContent
