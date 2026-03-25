import { useState, useMemo, useRef } from "react";

type Status = "todo" | "inprogress" | "review" | "done";
type Priority = "low" | "medium" | "high" | "critical";

type Task = {
  id: number;
  title: string;
  status: Status;
  priority: Priority;
  assignee: string;
  startDate?: string;
  dueDate: string;
};

const users = ["AL", "RM", "JS", "KP", "NV", "AR"];

const getRandomDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * 20 - 10));
  return d.toISOString().split("T")[0];
};

const getPriorityColor = (p: Priority) => {
  switch (p) {
    case "low": return "#94a3b8";
    case "medium": return "#3b82f6";
    case "high": return "#f59e0b";
    case "critical": return "#ef4444";
  }
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<"kanban" | "list" | "timeline">("kanban");
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [hoverStatus, setHoverStatus] = useState<Status | null>(null);

  const [sortKey, setSortKey] = useState<"title" | "priority" | "dueDate">("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");

  // mock collaboration
  // const [activeUsers, setActiveUsers] = useState<{ user: string; taskId: number }[]>([]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setActiveUsers(users.slice(0, 3).map(u => ({
  //       user: u,
  //       taskId: Math.floor(Math.random() * tasks.length)
  //     })));
  //   }, 2000);
  //   return () => clearInterval(interval);
  // }, [tasks]);

  const generateTasks = () => {
    const statuses: Status[] = ["todo", "inprogress", "review", "done"];
    const priorities: Priority[] = ["low", "medium", "high", "critical"];

    const data: Task[] = Array.from({ length: 500 }, (_, i) => ({
      id: i,
      title: `Task ${i}`,
      status: statuses[Math.floor(Math.random() * 4)],
      priority: priorities[Math.floor(Math.random() * 4)],
      assignee: users[Math.floor(Math.random() * users.length)],
      startDate: Math.random() > 0.3 ? getRandomDate() : undefined,
      dueDate: getRandomDate(),
    }));

    setTasks(data);
  };

  const updateTaskStatus = (status: Status) => {
    if (draggedId === null) return;
    setTasks(prev => prev.map(t => t.id === draggedId ? { ...t, status } : t));
    setDraggedId(null);
  };

  // FILTER
  const filteredTasks = useMemo(() => {
    return tasks.filter(t =>
      filterPriority === "all" ? true : t.priority === filterPriority
    );
  }, [tasks, filterPriority]);

  // GROUP
  const groupedTasks = useMemo(() => ({
    todo: filteredTasks.filter(t => t.status === "todo"),
    inprogress: filteredTasks.filter(t => t.status === "inprogress"),
    review: filteredTasks.filter(t => t.status === "review"),
    done: filteredTasks.filter(t => t.status === "done"),
  }), [filteredTasks]);

  // SORT
  const priorityOrder: Record<Priority, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const sortedTasks = useMemo(() => {
    const sorted = [...filteredTasks].sort((a, b) => {
      let val = 0;
      if (sortKey === "title") val = a.title.localeCompare(b.title);
      if (sortKey === "priority") val = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (sortKey === "dueDate") val = a.dueDate.localeCompare(b.dueDate);
      return sortDir === "asc" ? val : -val;
    });
    return sorted;
  }, [filteredTasks, sortKey, sortDir]);

  const toggleSort = (key: any) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // VIRTUAL SCROLL
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const rowHeight = 40;
  const visibleCount = 15;

  const startIndex = Math.floor(scrollTop / rowHeight);
  const visibleRows = sortedTasks.slice(startIndex, startIndex + visibleCount);

  // TIMELINE
  // const _dayWidth = 20;
  // const monthStart = new Date();
  // monthStart.setDate(1);

  // const getOffset = (date: string) =>
  //   (new Date(date).getTime() - monthStart.getTime()) / (1000 * 3600 * 24);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>Task Dashboard</h2>

      <button onClick={generateTasks}>Generate Data</button>

      <div style={{ margin: 10 }}>
        <button onClick={() => setView("kanban")}>Kanban</button>
        <button onClick={() => setView("list")}>List</button>
        <button onClick={() => setView("timeline")}>Timeline</button>
      </div>

      {/* FILTER */}
      <select onChange={(e) => setFilterPriority(e.target.value as any)}>
        <option value="all">All</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>

      {/* KANBAN */}
      {view === "kanban" && (
        <div style={{ display: "flex", gap: 16 }}>
          {(Object.keys(groupedTasks) as Status[]).map(status => (
            <div key={status}
              onDragOver={e => e.preventDefault()}
              onDrop={() => updateTaskStatus(status)}
              onDragEnter={() => setHoverStatus(status)}
              onDragLeave={() => setHoverStatus(null)}
              style={{
                flex: 1,
                background: hoverStatus === status ? "#e0f2fe" : "#f1f5f9",
                padding: 10,
                maxHeight: 400,
                overflowY: "auto"
              }}>
              <h4>{status}</h4>

              {groupedTasks[status].map(task => {
                const today = new Date();
                const due = new Date(task.dueDate);
                const diff = Math.floor((due.getTime() - today.getTime()) / (1000 * 3600 * 24));

                return (
                  <div key={task.id}
                    draggable
                    onDragStart={() => setDraggedId(task.id)}
                    style={{
                      background: "white",
                      marginBottom: 10,
                      padding: 10,
                      opacity: draggedId === task.id ? 0.5 : 1,
                      boxShadow: draggedId === task.id ? "0 4px 10px rgba(0,0,0,0.2)" : "none",
                    }}>
                    <strong>{task.title}</strong>
                    <div style={{ color: getPriorityColor(task.priority) }}>{task.priority}</div>
                    <div>👤 {task.assignee}</div>
                    <div style={{ color: diff < 0 ? "red" : "inherit" }}>
                      {diff === 0 ? "Due Today" : diff < -7 ? `${Math.abs(diff)} days overdue` : task.dueDate}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* LIST */}
      {view === "list" && (
        <div>
          <div style={{ display: "flex", fontWeight: "bold" }}>
            <div style={{ flex: 2 }} onClick={() => toggleSort("title")}>Title</div>
            <div style={{ flex: 1 }} onClick={() => toggleSort("priority")}>Priority</div>
            <div style={{ flex: 1 }} onClick={() => toggleSort("dueDate")}>Due</div>
            <div style={{ flex: 1 }}>Status</div>
          </div>

          <div ref={containerRef}
            onScroll={e => setScrollTop((e.target as any).scrollTop)}
            style={{ height: 400, overflowY: "auto" }}>

            <div style={{ height: tasks.length * rowHeight, position: "relative" }}>
              {visibleRows.map((t, i) => (
                <div key={t.id}
                  style={{
                    position: "absolute",
                    top: (startIndex + i) * rowHeight,
                    display: "flex",
                    width: "100%",
                    height: rowHeight
                  }}>
                  <div style={{ flex: 2 }}>{t.title}</div>
                  <div style={{ flex: 1 }}>{t.priority}</div>
                  <div style={{ flex: 1 }}>{t.dueDate}</div>

                  <select
                    value={t.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as Status;
                      setTasks(prev =>
                        prev.map(task =>
                          task.id === t.id ? { ...task, status: newStatus } : task
                        )
                      );
                    }}
                  >
                    <option value="todo">Todo</option>
                    <option value="inprogress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TIMELINE */}
     {/* ---------------- TIMELINE ---------------- */}
{view === "timeline" && (
  <div style={{ overflowX: "scroll", whiteSpace: "nowrap", padding: 10 }}>
    {tasks.slice(0, 50).map((t) => {
      const today = new Date();
      const due = new Date(t.dueDate);

      const diffDays = Math.floor(
        (due.getTime() - today.getTime()) / (1000 * 3600 * 24)
      );

      return (
        <div
          key={t.id}
          style={{
            display: "inline-block",
            width: 150,
            margin: 5,
            padding: 10,
            borderRadius: 8,
            background: getPriorityColor(t.priority), // ✅ fixed
            color: "white",
            verticalAlign: "top",
            opacity: diffDays < 0 ? 0.6 : 1, // overdue fade
          }}
        >
          <div style={{ fontWeight: "bold" }}>{t.title}</div>
          <div style={{ fontSize: 12 }}>👤 {t.assignee}</div>
          <div style={{ fontSize: 12 }}>
            📅 {diffDays === 0 ? "Due Today" : t.dueDate}
          </div>
        </div>
      );
    })}
  </div>
)}
    </div>
  );
}