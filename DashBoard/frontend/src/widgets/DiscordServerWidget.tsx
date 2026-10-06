import type { WidgetDataGuilds } from "../dashboard/types"
import "./DiscordServerWidget.css"

type DiscordServerProps = {
    data : WidgetDataGuilds
}
const DISCORD_LOGO = "https://cdn.simpleicons.org/discord/ffffff"

function DiscordServerWidget ({ data } : DiscordServerProps) {
    return (
      <div className="widget-guilds">
        {data.guilds.map((guild) => (
          <div key={guild.id} className="widget-guild-item">
            {guild.iconUrl ? (
              <img src={guild.iconUrl} alt={guild.name} className="widget-guild-icon" />
            ) :
              <img src={DISCORD_LOGO} alt={guild.name} className="widget-guild-icon" />
            }
            <div className="widget-guild-info">
              <h4>{guild.name}</h4>
              <p className="widget-guild-stats">
                {guild.memberOnline} online
              </p>
            </div>
          </div>
        ))}
      </div>
    )
}

export default DiscordServerWidget
