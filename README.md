# TSBlog (RSS Blog Aggregator)

![GitHub License](https://img.shields.io/github/license/ellisf09/tsblog)
![GitHub last commit](https://img.shields.io/github/last-commit/ellisf09/tsblog)

<img src="https://skillicons.dev/icons?i=ts,mysql">

A TypeScript CLI RSS feed aggregator backed by PostgreSQL that fetches, stores, and browses blog posts from across the web.

### 🛠️ Built With
<p align="left">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev" alt="Tech Stack" />
  </a>
</p>

## ✨ Features
- **Multi-User Management:** Register and switch between local CLI user profiles.
- **Feed Subscriptions:** Add, follow, and unfollow RSS feeds stored in PostgreSQL.
- **Background Aggregation:** Continuously scrapes configured RSS feeds at set intervals and saves posts to the database.

## 🚀 Getting Started
1. **Clone the repository:**
   ```bash
   git clone https://github.com/ellisf09/tsblog
   cd tsblog
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure database:**
   Add your PostgreSQL connection string to your config file (`~/.gatorconfig.json` or `.env`).
4. **Run CLI commands:**
   ```bash
   npm run start <command> [args]
   ```
