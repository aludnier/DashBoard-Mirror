import {
  CommentIcon,
  GitMergeIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
  IssueClosedIcon,
  IssueOpenedIcon,
  type Icon,
} from '@primer/octicons-react'
import type { GithubItem, WidgetDataGithub } from '../dashboard/types'
import './GithubWidget.css'

type GithubWidgetProps = {
  data: WidgetDataGithub
}

function stateIcon(type: WidgetDataGithub['type'], state: GithubItem['state']): Icon {
  if (type === 'issue')
    return state === 'closed' ? IssueClosedIcon : IssueOpenedIcon
  switch (state) {
    case 'merged': return GitMergeIcon
    case 'draft': return GitPullRequestDraftIcon
    case 'closed': return GitPullRequestClosedIcon
    default: return GitPullRequestIcon
  }
}

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
]

function timeAgo(raw: string) {
  const seconds = (new Date(raw).getTime() - Date.now()) / 1000
  if (isNaN(seconds)) return raw
  for (const [unit, size] of UNITS)
    if (Math.abs(seconds) >= size)
      return relative.format(Math.round(seconds / size), unit)
  return 'just now'
}

function labelTextColor(hex: string) {
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#1f2328' : '#ffffff'
}

function GithubWidget({ data }: GithubWidgetProps) {
  return (
    <ul className="gh-list">
      {data.items.map((item) => {
        const StateIcon = stateIcon(data.type, item.state)
        return (
          <li key={item.id} className="gh-row">
            <span className={`gh-state gh-state--${item.state}`} aria-label={item.state}>
              <StateIcon size={16} />
            </span>

            <div className="gh-main">
              <div className="gh-title-line">
                <a className="gh-title" href={item.url} target="_blank" rel="noreferrer">
                  {item.title}
                </a>
                {item.labels.map((label) => (
                  <span
                    key={label.name}
                    className="gh-label"
                    style={{ background: `#${label.color}`, color: labelTextColor(label.color) }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
              <div className="gh-meta">
                #{item.number} {item.state === 'open' || item.state === 'draft' ? 'opened' : item.state}{' '}
                {timeAgo(item.createdAt)} by {item.author}
              </div>
            </div>

            {!!item.comments && (
              <span className="gh-comments">
                <CommentIcon size={16} /> {item.comments}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default GithubWidget
