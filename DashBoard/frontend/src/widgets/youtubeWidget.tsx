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
          <h3>
          {playlist.thumbnailUrl && (
            <img src={playlist.thumbnailUrl} alt={playlist.title} />
          )}
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
      ))}
    </div>
  )
}

export default YoutubeWidget
