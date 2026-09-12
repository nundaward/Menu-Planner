import { weekLabel } from '../state.js'

export default function Topbar({
  weekStart,
  isCurrentWeek,
  saveStatus,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  onSignOut,
}) {
  return (
    <div className="topbar">
      <div className="brand">
        <h1>Menu Planner</h1>
        <div className="sub">Plan your week, build your grocery list.</div>
      </div>
      <div className="weeknav-wrap">
        <div className="weeknav">
          <button className="navbtn" onClick={onPrevWeek} aria-label="Previous week">‹</button>
          <div className="weeklabel mono">{weekLabel(weekStart)}</div>
          <button className="navbtn" onClick={onNextWeek} aria-label="Next week">›</button>
        </div>
        <button className="today-link" onClick={onCurrentWeek} disabled={isCurrentWeek}>
          Go to current week
        </button>
      </div>
      <div className="savebox">
        <span className={`status ${saveStatus === 'saving' ? 'saving' : ''} ${saveStatus === 'error' ? 'error' : ''}`}>
          {saveStatus === 'saving' && 'Saving…'}
          {saveStatus === 'saved' && 'All changes saved'}
          {saveStatus === 'error' && 'Save failed'}
        </span>
        <button className="signout-link" onClick={onSignOut}>Sign out</button>
      </div>
    </div>
  )
}
