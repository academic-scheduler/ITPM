# Academic Scheduler

Academic Scheduler is a conflict-free timetable management system designed to help students, teachers, and academic institutions create and manage schedules efficiently. This full-stack web application is built with **React** (frontend) and **Django** (backend).

---

## 🛠️ Features

### 🔄 CRUD-Based Functionalities

#### 1. Course Management
- **Create**: Add new courses with details like name, code, instructor, and credit hours.
- **Read**: View all courses and their details.
- **Update**: Modify course information (e.g., instructor, time slot).
- **Delete**: Remove outdated or canceled courses.
- **Example**: An admin adds "Introduction to Machine Learning" with a specific time slot and instructor.

#### 2. Timetable Generation
- **Create**: Generate a conflict-free timetable for students or teachers.
- **Read**: View the timetable for individuals or classes.
- **Update**: Adjust time slots, reschedule classes.
- **Delete**: Cancel scheduled sessions.

#### 3. Room Allocation
- **Create**: Assign rooms to courses based on availability and capacity.
- **Read**: View schedules for each room.
- **Update**: Reassign rooms in case of conflicts.
- **Delete**: Remove assignments for canceled events.

---

## 🧠 Novelty Feature: Smart Scheduling Assistant

The **Smart Scheduling Assistant** goes beyond basic CRUD. It analyzes schedules and dynamically suggests optimal time slots and resources for new events, considering:
- Instructor availability
- Room availability
- Existing scheduled events

### 🎯 Purpose
- Automate conflict-free scheduling
- Optimize resource allocation
- Minimize manual trial-and-error

### 🧩 How It Works

#### Input Parameters:
- `title`: Event name (e.g., "Math Lecture")
- `duration`: Duration of the event
- `instructor_id`: Assigned instructor
- `preferred_start_time` (optional)

#### Step-by-Step Logic:
1. **Conflict Detection**: Check instructor and room availability.
2. **Alternative Room Suggestion**: Suggest similar rooms if the preferred one is taken.
3. **Alternative Time Suggestion**: If no rooms are free at the preferred time, find instructor’s available gaps.
4. **Return Recommendation**:
   - Optimal slot and room (if conflict-free)
   - Alternatives (if conflicts exist)

---

## ⚙️ Tech Stack

| Frontend | Backend | Database | Others |
|----------|---------|----------|--------|
| React.js | Django REST Framework | PostgreSQL | Axios, TailwindCSS |

