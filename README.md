# Task Dashboard

## 🔗 Live Demo

https://task-dashboard-dusky-five.vercel.app

## 📁 GitHub Repository

https://github.com/layakc2022-hash/task-dashboard

---

## 🚀 Setup Instructions

1. Clone the repository:

```
git clone https://github.com/layakc2022-hash/task-dashboard.git
```

2. Navigate to project folder:

```
cd task-dashboard
```

3. Install dependencies:

```
npm install
```

4. Run the project:

```
npm run dev
```

---

## 🧠 State Management

I used React's built-in hooks such as `useState` and `useMemo` for managing application state. This approach keeps the implementation simple and avoids the use of external libraries as required. `useMemo` is used to optimize performance by memoizing filtered and sorted task data.

---

## 📊 Virtual Scrolling

Virtual scrolling is implemented in the list view to efficiently handle large datasets (500+ tasks). Only the visible rows are rendered based on the scroll position, while maintaining the overall scroll height. This improves performance and ensures smooth scrolling.

---

## 🔄 Drag and Drop

Drag and drop functionality is implemented using native browser drag events. Tasks can be dragged between different status columns in the Kanban view, and their status is updated dynamically on drop.

---

## 📅 Timeline View

The timeline view displays tasks in a horizontal layout. Tasks are visually represented as cards with priority-based coloring and due date information. Overdue tasks are visually distinguished for better usability.

---

## ⚡ Improvements

With more time, I would:

* Improve the timeline to represent accurate time-based positioning
* Add smoother drag-and-drop animations
* Implement multi-filtering and URL-based state persistence
* Enhance UI/UX with better spacing and visual feedback

---

## 📸 Lighthouse Report

![Lighthouse Report](./lighthouse.png)
---

## 📝 Conclusion

This project demonstrates handling large datasets, implementing drag-and-drop interactions, and building multiple views (Kanban, List, Timeline) using React and TypeScript without relying on external libraries.
