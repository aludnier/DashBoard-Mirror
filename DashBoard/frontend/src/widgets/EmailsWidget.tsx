import type { WidgetDataEmails } from '../dashboard/types'
import './EmailWidget.css'

type EmailsWidgetProps = {
  data: WidgetDataEmails
}

function senderName(sender: string) {
  const match = sender.match(/^"?([^"<]*?)"?\s*<.*>$/)
  return (match?.[1] || sender).trim()
}

function formatDate(raw: string) {
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  const now = new Date()
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  if (d.getFullYear() === now.getFullYear())
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  return d.toLocaleDateString()
}

function EmailsWidget({ data }: EmailsWidgetProps) {
    return (
        <div className="emails">
          {data.emails.map((email) => (
            <a
              key={email.id}
              className="email-row"
              href={email.url}
              target="_blank"
              rel="noreferrer"
            >
              <span className="email-sender">{senderName(email.sender)}</span>
              <span className="email-title">{email.title || '(no subject)'}</span>
              <span className="email-date">{formatDate(email.date)}</span>
            </a>
          ))}
        </div>
    )
}

export default EmailsWidget
