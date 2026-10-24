<div align="center">

# 🖥️ ATLANTECH — Web Dashboard

### Port-Wide Operations Dashboard

![Status](https://img.shields.io/badge/status-in%20development-A58D66?style=for-the-badge)
![Part of](https://img.shields.io/badge/part%20of-ATLANTECH-083A4F?style=for-the-badge)

![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![REST API](https://img.shields.io/badge/REST%20API-083A4F?style=flat-square)
![SSE](https://img.shields.io/badge/SSE-realtime-407E8C?style=flat-square)

</div>

---

## 📖 Overview

The web dashboard is the main workspace for **Port Authority staff, terminal planners, marine safety officers and administrators**. It runs inside the port LAN and talks to the Laravel Port API over HTTPS, receiving live updates through **Server-Sent Events**.

### Key features
- 📝 **Berthing requests** — submit, review, approve and track through every lifecycle status.
- 🌊 **Entry windows** — review AI Part 1 feasible windows and blocked periods, then confirm (human gate 1).
- ⚓ **Recommendations** — compare ranked berth / tug / pilot options with rationale, confirm or override (human gate 2).
- 📦 **BAPLIE & yard** — upload BAPLIE files and review container-yard placement for the Container Terminal.
- 📡 **Tracking & deviations** — follow plan execution and actual status in real time.
- 👥 **Users, roles & devices** — RBAC with terminal-level data isolation.
- 🪪 **License status** — `SETUP` / `FULL` / `READ_ONLY` mode banners.

---

## 🎨 Brand

| Color | Hex |
|---|---|
| Deep Navy | `#083A4F` |
| Muted Gold | `#A58D66` |
| Light Teal | `#C0D5D6` |
| Mid Teal | `#407E8C` |
| Off-White | `#E5E1DD` |

**Typography:** Montserrat (primary) · Inter (secondary)

---

## 🛠️ Tech Stack

| Area | Technology |
|---|---|
| Framework | Vue.js |
| Communication | REST over HTTPS · Server-Sent Events |
| Backend | [ATLANTECH Port API](https://github.com/Atlantech-project/project-backend) (Laravel) |

---

## 🚀 Getting Started

```bash
git clone https://github.com/Atlantech-project/project-frontend.git
cd project-frontend
```

> Setup instructions will be added once the project is scaffolded.

---

## 🔗 Related Repositories

| | Repository |
|---|---|
| ⚓ Umbrella | [PortHub](https://github.com/Atlantech-project/PortHub) |
| ⚙️ Backend | [project-backend](https://github.com/Atlantech-project/project-backend) |
| 🧠 AI | [project-ai](https://github.com/Atlantech-project/project-ai) |
| 📱 Mobile | [project-mobile](https://github.com/Atlantech-project/project-mobile) |

## 👥 Frontend Team

- **Mostafa Safy Mostafa Soliman** — Frontend Engineer
- **Mostafa El-Hassanen El-Hassanen El-Sharawey** — Frontend Engineer
- **Menna-Allah Maged Nabil Mohamed** — UI/UX Designer

---

<div align="center">

⚓ *ATLANTECH — Intelligent Port Operations* · Mansoura University · Graduation Project 2026

</div>
