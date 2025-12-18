const EMOJIS = ["🎯","💰","📈","📦","🔥","⭐","🧠","🛒","⏳"];

export default function GoalCard({ goal, onDelete, onUpdate }) {
  const pct = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0;

  function cycleEmoji() {
    const i = EMOJIS.indexOf(goal.emoji);
    onUpdate(goal.id, { emoji: EMOJIS[(i + 1) % EMOJIS.length] });
  }

  return (
    <div className="goal-card">
      <div className="goal-header">
        <div className="goal-title-row">
          <button className="emoji-btn" onClick={cycleEmoji}>{goal.emoji}</button>
          <div>
            <div className="goal-title">{goal.title}</div>
            <div className="goal-desc">{goal.description}</div>
          </div>
        </div>

        <div className="goal-actions">
          <span className={`status ${goal.health}`}>{goal.health}</span>
          {goal.status !== "active" && <span className={`status ${goal.status}`}>{goal.status}</span>}
          <button className="icon-btn" onClick={()=>onUpdate(goal.id,{__edit:true})}>✏️</button>
          <button className="icon-btn" onClick={()=>onUpdate(goal.id,{status:goal.status==="paused"?"active":"paused"})}>⏸</button>
          <button className="icon-btn" onClick={()=>onUpdate(goal.id,{status:"archived"})}>📦</button>
          <button className="icon-btn danger" onClick={()=>onDelete(goal.id)}>🗑</button>
        </div>
      </div>

      <div className="goal-values">
        <span className="muted">£{goal.current} / £{goal.target}</span>
        <span className="pct">{pct.toFixed(1)}%</span>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{width:`${pct}%`}} />
        <div className="progress-emoji">{goal.emoji}</div>
      </div>
    </div>
  );
}
