# Technology Stack — Comparative Study

Comparative study made by the team to choose the technology stack of the Dashboard project.

Each option is scored from **1 to 5** on every criterion. Each criterion has a **weight from 1 to 3** (3 = most important). The weighted total is the sum of `score × weight` (maximum possible: **65**).

## Table of Contents

- [Back End](#back-end)
- [Front End](#front-end)
- [Sensitivity Check](#sensitivity-check)
- [Conclusion](#conclusion)
- [Criteria Explained](#Criteria-Explained)

---

## Back End

| Criterion | <span style="color: green;">Node </span> | Go | PHP | Java | Django | Weight (1 - 3) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Docker deployment convenience | 4 | 5 | 3 | 2 | 3 | 2 |
| Suitability for real-time data refresh | 5 | 5 | 2 | 3 | 3 | 3 |
| Ecosystem quality: available packages, third-party integrations, widget libraries | 5 | 3 | 3 | 4 | 4 | 3 |
| Experience | 3 | 1 | 1 | 1 | 1 | 2 |
| Documentation / long term | 4 | 5 | 4 | 5 | 5 | 1 |
| Learning value | 4 | 4 | 3 | 4 | 4 | 2 |
| **Weighted total** | <span style="color: green;">**56**</span> | **49** | **33** | **40** | **42** | |

---

## Front End

| Criterion | Vue | Svelte | Angular | <span style="color: green;">React</span> | Weight (1 - 3) |
|---|:---:|:---:|:---:|:---:|:---:|
| Docker deployment convenience | 4 | 4 | 3 | 4 | 2 |
| Suitability for real-time data refresh | 4 | 4 | 4 | 4 | 3 |
| Ecosystem quality: available packages, third-party integrations, widget libraries | 3 | 2 | 4 | 5 | 3 |
| Experience | 1 | 1 | 1 | 3 | 2 |
| Documentation / long term | 4 | 3 | 4 | 4 | 1 |
| Learning value | 3 | 2 | 3 | 5 | 2 |
| **Weighted total** | **41** | **35** | **42** | <span style="color: green;">**55**</span> | |

---

## Sensitivity Check

The "Experience" criterion favors what the team already knows. To check that the result does not depend only on it, the totals are recomputed without it:

| Back End | Node | Go | Django | Java | PHP |
|---|:---:|:---:|:---:|:---:|:---:|
| Total without "Experience" | **50** | 47 | 40 | 38 | 31 |

| Front End | React | Angular | Vue | Svelte |
|---|:---:|:---:|:---:|:---:|
| Total without "Experience" | **49** | 40 | 39 | 33 |

The Result stay the same, but the gap between Node and Go shrinks to 3 points.

---

## Conclusion

- **Back End: Node** has the highest weighted total (56), ahead of Go (49) and Django (42). It scores best on real-time data refresh and ecosystem quality, and it is the option the team has the most experience with. This matches the NestJS backend used in the project.
  - **Additional argument : NestJS makes hexagonal architecture easier.** Its dependency injection and module system make it straightforward to define ports (interfaces) in the domain and plug in adapters (Prisma repositories, OAuth providers) without coupling the business logic to them. This is the structure used in the project (see [DEVELOPMENT.md](./DEVELOPMENT.md#system-architecture)).
- **Front End: React** has the highest weighted total (55), well ahead of Angular (42) and Vue (41). It leads on ecosystem quality, experience and learning value. This matches the React frontend used in the project.

---

## Criteria Explained

| Criterion | Weight | Why this criterion |
|---|:---:|---|
| Docker deployment convenience | 2 | The project is deployed with Docker / docker-compose, so the stack should be easy to containerize (image size, build simplicity, runtime requirements). |
| Suitability for real-time data refresh | 3 | The core of the project is widgets that refresh their data regularly, so the stack must handle frequent, concurrent requests well. |
| Ecosystem quality: available packages, third-party integrations, widget libraries | 3 | The project relies on OAuth providers, external APIs (GitHub, Google, YouTube) and drag-and-drop / widget libraries. A rich ecosystem saves development time. |
| Experience | 2 | The team's existing knowledge reduces risk and speeds up development within a limited project time. |
| Documentation / long term | 1 | Good documentation and a stable, maintained technology make the project easier to maintain. It has the lowest weight because all the compared options are mature. |
| Learning value | 2 | The project is also a learning exercise, so a technology that is useful to learn and relevant in the job market is a plus. |

**Weights:** 3 = critical for the project's core features, 2 = important, 1 = nice to have.
