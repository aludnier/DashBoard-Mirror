import type { WidgetDataCalendar } from "../dashboard/types"
import "./CalendarWidget.css"

type CalendarWidgetProps = {
  data: WidgetDataCalendar
}

type CalendarEvent = WidgetDataCalendar["events"][number]

const isAllDay = (value: string) => value.length === 10

function parseDate(value: string): Date {
  if (isAllDay(value)) {
    const [y, m, d] = value.split("-").map(Number)
    return new Date(y, m - 1, d)
  }
  return new Date(value)
}

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" })
const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: "long" })
const dateFormat = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" })

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function dayLabel(date: Date, now: Date) {
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  if (dayKey(date) === dayKey(now)) return "Today"
  if (dayKey(date) === dayKey(tomorrow)) return "Tomorrow"
  return weekdayFormat.format(date)
}

function groupByDay(events: CalendarEvent[]) {
  const groups = new Map<string, { date: Date; events: CalendarEvent[] }>()
  for (const event of events) {
    const date = parseDate(event.startTime)
    const key = dayKey(date)
    const group = groups.get(key)
    if (group) group.events.push(event)
    else groups.set(key, { date, events: [event] })
  }
  return [...groups.values()]
}

function EventRow({ event, now }: { event: CalendarEvent; now: Date }) {
  const allDay = isAllDay(event.startTime)
  const start = parseDate(event.startTime)
  const end = parseDate(event.endTime)
  const inProgress = !allDay && start <= now && now < end

  const body = (
    <>
      <span className="cal-time">
        {allDay ? (
          "All day"
        ) : (
          <>
            <span>{timeFormat.format(start)}</span>
            <span className="cal-time-end">{timeFormat.format(end)}</span>
          </>
        )}
      </span>
      <span className="cal-bar" aria-hidden="true" />
      <span className="cal-info">
        <span className="cal-title">{event.title || "(No title)"}</span>
        {event.location && <span className="cal-location">{event.location}</span>}
      </span>
      {inProgress && <span className="cal-now">Now</span>}
    </>
  )

  const className = `cal-event${inProgress ? " cal-event--now" : ""}`

  return (
    <li>
      {event.linkUrl ? (
        <a
          className={className}
          href={event.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={event.description}
        >
          {body}
        </a>
      ) : (
        <div className={className} title={event.description}>
          {body}
        </div>
      )}
    </li>
  )
}

function CalendarWidget({ data }: CalendarWidgetProps) {
  const now = new Date()

  if (data.events.length === 0) {
    return (
      <div className="cal-empty">
        <p className="cal-empty-title">Nothing scheduled</p>
        <p className="cal-empty-text">No events in this period.</p>
      </div>
    )
  }

  const days = groupByDay(data.events)

  return (
    <div className="cal">
      {days.map(({ date, events }) => (
        <section className="cal-day" key={dayKey(date)}>
          <h3 className="cal-day-head">
            <span className="cal-day-name">{dayLabel(date, now)}</span>
            <span className="cal-day-date">{dateFormat.format(date)}</span>
          </h3>
          <ul className="cal-list">
            {events.map((event) => (
              <EventRow key={event.id} event={event} now={now} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default CalendarWidget
