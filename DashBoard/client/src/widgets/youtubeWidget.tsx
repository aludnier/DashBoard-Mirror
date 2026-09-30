import { useEffect, useState } from 'react'
import { getUserSession } from '../client'
import { fetchWidgetData } from '../dashboard/api'
import type { WidgetInstance } from '../dashboard/types'

type YoutubeGoogleWidgetProps = {
  instance: WidgetInstance
}

type PlaylistData = {
  kind: 'playlists'
  playlists: Array<{
    id: string
    title: string
    description?: string
    thumbnailUrl?: string
  }>
}

function YoutubeGoogleWidget({ instance }: YoutubeGoogleWidgetProps) {
  const [data, setData] = useState<PlaylistData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = getUserSession()?.id

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    let cancelled = false

    fetchWidgetData(userId, instance.id)
      .then((result) => {
        if (cancelled) return

        if (result.kind !== 'playlists') {
          throw new Error('Unexpected widget payload')
        }

        setData(result)
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[YOUTUBE]', err)
          setError('Cannot access YouTube.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId, instance.id])

  if (loading) return <div>Connecting...</div>
  if (error) return <div>{error}</div>
  if (!data || !data.playlists?.length) return <div>No Data.</div>

  return (
    <div className="playlists">
      {data.playlists.map((playlist) => (
        <div key={playlist.id} className="playlist">
          <h3>
            <a target="_blank"
              href={`https://www.youtube.com/playlist?list=${playlist.id}`}>
              {playlist.title}
            </a>
          </h3>

          {playlist.thumbnailUrl && (
            <img src={playlist.thumbnailUrl} alt={playlist.title} />
          )}

          {playlist.description && <p>{playlist.description}</p>}
        </div>
      ))}
    </div>
  )
}

export default YoutubeGoogleWidget
