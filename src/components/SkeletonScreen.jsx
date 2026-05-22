export default function SkeletonScreen() {
  return (
    <div className="skeleton-screen">
      <div className="skeleton-header">
        <div className="sk sk-logo" />
        <div className="sk-header-right">
          <div className="sk sk-badge" />
          <div className="sk sk-badge" />
          <div className="sk sk-avatar" />
        </div>
      </div>
      <div className="skeleton-body">
        <div className="sk sk-banner" />
        {[1, 2, 3].map(i => (
          <div key={i} className="sk sk-card" />
        ))}
      </div>
    </div>
  )
}
