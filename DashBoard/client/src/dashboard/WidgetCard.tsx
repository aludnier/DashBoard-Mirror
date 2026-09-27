import type { WidgetInstance } from './types'

interface WidgetCardProps {
  instance: WidgetInstance
}

// Renders one grid cell. Actual per-widget-type content (charts, metrics, etc.)
// is out of scope for the shell and comes from the widget catalog work.
function WidgetCard({ instance }: WidgetCardProps) {
  return (
    <div className="widget-card">
      <div className="widget-card-header drag-handle">
        <span className="widget-card-title">
          {instance.widgetDefinition?.name ?? 'Widget'}
        </span>
      </div>
      <div className="widget-card-body">
        <p>Widget content coming soon.</p>
      </div>
    </div>
  )
}

export default WidgetCard
