import { useEffect, useState } from 'react'
import { apiErrorMessage, getUserSession } from '../client'
import { fetchWidgetData } from './api'
import { type WidgetData, type WidgetInstance } from './types'
import YoutubeWidget from '../widgets/youtubeWidget'
import DiscordServerWidget from '../widgets/DiscordServerWidget'
import EmailsWidget from '../widgets/EmailsWidget'
import CalendarWidget from '../widgets/CalendarWidget'
import GithubWidget from '../widgets/GithubWidget'

interface WidgetContentProps {
  instance: WidgetInstance
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

    const load = () => {
      fetchWidgetData(userId, instanceId)
        .then((result) => {
          if (cancelled) return
          setData(result)
          setError(null)
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

  // Render YouTube playlists widget
  if (data.kind === 'playlists') {
    if (data.playlists.length === 0)
      return <p>Nothing to show.</p>

    return <YoutubeWidget data={data} />
  }

  // Render generic list widget
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

  if (data.kind === 'emails') {
    if (data.emails.length === 0)
      return <p>Nothing to show.</p>
    return (
      <EmailsWidget data={data}/>
    )
  }

  if (data.kind === 'calendar') {
      return  <CalendarWidget data={data}/>
  }

  // Render guilds/Discords widget
  if (data.kind === 'guilds') {
    if (data.guilds.length === 0)
      return <p>Nothing to show.</p>

    return (
      <DiscordServerWidget data={data}/>
    )
  }

  // Render generic record widget
  if (data.kind === 'record') {
    return (
      <div className="widget-record">
        <pre>{JSON.stringify(data.data, null, 2)}</pre>
      </div>
    )
  }

  if (data.kind === 'github') {
    if (data.items.length === 0)
      return <p>Nothing to show.</p>

    return <GithubWidget data={data} />
  }

  return <p>Unknown widget type.</p>
}

export default WidgetContent
