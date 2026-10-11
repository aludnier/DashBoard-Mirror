import type { WidgetDataPlaylists } from '../dashboard/types'
import './youtubeWidget.css'

type YoutubeWidgetProps = {
  data: WidgetDataPlaylists
}

function YoutubeWidget({ data }: YoutubeWidgetProps) {
  return (
    <div className="playlists">
      {data.playlists.map((playlist) => (
        <div key={playlist.id} className="playlist">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
          </svg>
          {playlist.thumbnailUrl && (
            <img src={playlist.thumbnailUrl} alt={playlist.title} />
          )}
          <div className="playlist-content">
            <h3>
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://www.youtube.com/playlist?list=${playlist.id}`}
              >
                {playlist.title}
              </a>
            </h3>
            {playlist.description && <p>{playlist.description}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

export default YoutubeWidget
