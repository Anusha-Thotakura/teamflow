// src/components/DeadlineHeatmap.js
import { useMemo } from "react";

const DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

export default function DeadlineHeatmap({ tasks }) {

  const today = new Date();
  const year  = today.getFullYear();
  const month = today.getMonth();

  // Build a map: "YYYY-MM-DD" → list of tasks due that day
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach(task => {
      if (!task.dueDate) return;
      const key = task.dueDate.slice(0, 10); // "2026-05-15"
      if (!map[key]) map[key] = [];
      map[key].push(task);
    });
    return map;
  }, [tasks]);

  // Calendar grid for current month
  const firstDay    = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  // Empty cells before month starts
  for (let i = 0; i < firstDay; i++) cells.push(null);
  // Day cells
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayStr = `${year}-${String(month+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  function cellColor(dayTasks, dateStr) {
    if (!dayTasks || dayTasks.length === 0) return null;
    const isOverdue = dateStr < todayStr;
    const hasDone   = dayTasks.every(t => t.status === "DONE");
    if (hasDone)    return { bg: "#a6e3a122", border: "#a6e3a1", dot: "#a6e3a1" }; // all done → green
    if (isOverdue)  return { bg: "#f38ba822", border: "#f38ba8", dot: "#f38ba8" }; // overdue → red
    const hasHigh   = dayTasks.some(t => t.priority === "HIGH");
    if (hasHigh)    return { bg: "#fab38722", border: "#fab387", dot: "#fab387" }; // high priority → orange
    return                  { bg: "#89b4fa22", border: "#89b4fa", dot: "#89b4fa" }; // normal → blue
  }

  // Upcoming tasks (next 7 days)
  const upcoming = tasks
    .filter(t => {
      if (!t.dueDate || t.status === "DONE") return false;
      const due  = new Date(t.dueDate);
      const diff = Math.ceil((due - today) / (1000*60*60*24));
      return diff >= 0 && diff <= 7;
    })
    .sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));

  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate || t.status === "DONE") return false;
    return new Date(t.dueDate) < today;
  });

  return (
    <div style={s.card}>
      <div style={s.header}>
        <h3 style={s.title}>📅 Deadline Heatmap</h3>
        <p style={s.sub}>{MONTHS[month]} {year}</p>
      </div>

      {/* Legend */}
      <div style={s.legend}>
        {[
          { color: "#f38ba8", label: "Overdue" },
          { color: "#fab387", label: "High Priority" },
          { color: "#89b4fa", label: "Upcoming" },
          { color: "#a6e3a1", label: "Completed" },
        ].map(({ color, label }) => (
          <div key={label} style={s.legendItem}>
            <div style={{ ...s.legendDot, background: color }} />
            <span style={s.legendLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* Day headers */}
      <div style={s.grid}>
        {DAYS.map(d => (
          <div key={d} style={s.dayHeader}>{d}</div>
        ))}

        {/* Calendar cells */}
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;

          const dateStr  = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const dayTasks = tasksByDate[dateStr];
          const colors   = cellColor(dayTasks, dateStr);
          const isToday  = dateStr === todayStr;

          return (
            <div
              key={dateStr}
              title={dayTasks ? dayTasks.map(t => t.title).join(", ") : ""}
              style={{
                ...s.cell,
                background:  colors ? colors.bg : "transparent",
                border:      isToday ? "2px solid #cba6f7" : colors ? `1px solid ${colors.border}` : "1px solid #31324444",
                position: "relative",
              }}
            >
              <span style={{ ...s.dayNum, color: isToday ? "#cba6f7" : "#cdd6f4", fontWeight: isToday ? 700 : 400 }}>
                {day}
              </span>
              {dayTasks && (
                <div style={s.dots}>
                  {dayTasks.slice(0, 3).map((_, di) => (
                    <div key={di} style={{ ...s.dot, background: colors.dot }} />
                  ))}
                  {dayTasks.length > 3 && (
                    <span style={{ fontSize: 8, color: colors.dot }}>+{dayTasks.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overdue alert */}
      {overdueTasks.length > 0 && (
        <div style={s.overdueBox}>
          <p style={s.overdueTitle}>⚠️ {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? "s" : ""}</p>
          {overdueTasks.map(t => (
            <div key={t.id} style={s.overdueItem}>
              <span style={{ color: "#f38ba8", fontSize: 12 }}>• {t.title}</span>
              <span style={{ color: "#6c7086", fontSize: 11 }}>
                {t.projectName} · was due {t.dueDate}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming this week */}
      {upcoming.length > 0 && (
        <div style={s.upcomingBox}>
          <p style={s.upcomingTitle}>📌 Due This Week</p>
          {upcoming.map(t => {
            const due     = new Date(t.dueDate);
            const diffDay = Math.ceil((due - today) / (1000*60*60*24));
            const label   = diffDay === 0 ? "Today" : diffDay === 1 ? "Tomorrow" : `In ${diffDay} days`;
            const color   = diffDay === 0 ? "#f38ba8" : diffDay <= 2 ? "#fab387" : "#89b4fa";
            return (
              <div key={t.id} style={s.upcomingItem}>
                <div style={{ flex: 1 }}>
                  <span style={{ color: "#cdd6f4", fontSize: 13 }}>{t.title}</span>
                  <span style={{ color: "#6c7086", fontSize: 11, display: "block" }}>{t.projectName}</span>
                </div>
                <span style={{ ...s.dueBadge, background: color + "22", color }}>{label}</span>
              </div>
            );
          })}
        </div>
      )}

      {upcoming.length === 0 && overdueTasks.length === 0 && (
        <p style={{ color: "#6c7086", fontSize: 13, textAlign: "center", marginTop: 12 }}>
          🎉 No upcoming deadlines this week!
        </p>
      )}
    </div>
  );
}

const s = {
  card:          { background: "#313244", borderRadius: 12, padding: 24, marginBottom: 24 },
  header:        { marginBottom: 12 },
  title:         { color: "#cdd6f4", fontSize: 18, fontWeight: 700, margin: 0 },
  sub:           { color: "#6c7086", fontSize: 13, margin: "4px 0 0 0" },
  legend:        { display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" },
  legendItem:    { display: "flex", alignItems: "center", gap: 6 },
  legendDot:     { width: 10, height: 10, borderRadius: "50%" },
  legendLabel:   { color: "#a6adc8", fontSize: 12 },
  grid:          { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 16 },
  dayHeader:     { color: "#6c7086", fontSize: 11, fontWeight: 600, textAlign: "center", padding: "4px 0" },
  cell:          { borderRadius: 6, padding: "6px 4px", minHeight: 44, display: "flex", flexDirection: "column", alignItems: "center", cursor: "default" },
  dayNum:        { fontSize: 12 },
  dots:          { display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center", marginTop: 2 },
  dot:           { width: 5, height: 5, borderRadius: "50%" },
  overdueBox:    { background: "#f38ba811", border: "1px solid #f38ba844", borderRadius: 8, padding: 12, marginBottom: 12 },
  overdueTitle:  { color: "#f38ba8", fontSize: 13, fontWeight: 700, margin: "0 0 8px 0" },
  overdueItem:   { display: "flex", flexDirection: "column", gap: 2, marginBottom: 6 },
  upcomingBox:   { background: "#F5F3FF", borderRadius: 8, padding: 12 },
  upcomingTitle: { color: "#89b4fa", fontSize: 13, fontWeight: 700, margin: "0 0 8px 0" },
  upcomingItem:  { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #31324444" },
  dueBadge:      { fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 },
};