interface EmptyStateProps {
  onAddWidget?: () => void
}

function EmptyState({ onAddWidget }: EmptyStateProps) {
  return (
    <div className="dashboard-empty-state">
      <h2>Your dashboard is empty</h2>
      <p>Add a widget to start tracking your services here.</p>
      {onAddWidget && (
        <button type="button" onClick={onAddWidget}>
          Add your first widget
        </button>
      )}
    </div>
  )
}

export default EmptyState
