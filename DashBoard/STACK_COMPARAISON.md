# Technology Stack — Comparative Study

Comparative study made by the team to choose the technology stack of the Dashboard project.

Each option is scored from **1 to 5** on every criterion. Each criterion has a **weight from 1 to 3** (3 = most important). The weighted total is the sum of `score × weight` (maximum possible: **65**).

## 📋 Table of Contents

- [Back End](#back-end)
- [Front End](#front-end)
- [Sensitivity Check](#sensitivity-check)
- [Conclusion](#conclusion)
- [Limitations & Notes](#limitations--notes)

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

## Limitations & Notes

- **Languages vs frameworks:** the Back End table compares languages, while the final choice is a framework (NestJS). A comparison of frameworks (e.g. NestJS, Gin, Laravel, Spring Boot) would be more precise.
- **"Experience" vs "Learning value":** the two criteria pull in opposite directions (one rewards familiarity, the other novelty). "Learning value" could be defined more precisely, for example as career value or new skills gained.
- **Low-discrimination criteria:** on the Front End, "Docker deployment convenience" and "Suitability for real-time data refresh" give almost the same scores to every option (all frameworks build to static files). The real-time criterion has a weight of 3 but barely separates the options.
- **Real-time requirement:** the client re-fetches widget data at a `refreshRateSeconds` interval (polling), which is less demanding than true push-based real-time. This may make the low scores of PHP (2) and Java (3) on real-time suitability harsher than they should be.
- **Debatable scores:** Java's real-time score (3) and PHP's ecosystem score (3) could be argued higher, given Java's concurrency strengths and PHP's Composer/Packagist and Laravel ecosystem. The original scores were kept as submitted.
- **Combined criterion:** "Ecosystem quality" merges three things (available packages, third-party integrations, widget libraries) that do not always move together.
- **Architecture support is not scored:** NestJS's support for hexagonal architecture is mentioned in the conclusion but is not a criterion in the table. It is a framework-level advantage (other frameworks such as Spring Boot also support this architecture well), so it supports the choice of NestJS rather than Node against the other languages. A dedicated "Architecture support" criterion would make the comparison fairer.
- **Criteria not covered:** type safety and TypeScript sharing between client and server, ORM quality (Prisma), OAuth library support, testing tools, and community size. With Node leading Go by 7 points, adding any of these could change the Back End ranking.
