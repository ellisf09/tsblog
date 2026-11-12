# Gator

Gator is a TypeScript CLI for following RSS feeds and browsing their posts.

## Requirements

- Node.js 22 or newer
- npm
- PostgreSQL

## Setup

Install the dependencies:

```sh
npm install
```

Create a PostgreSQL database named `gator`, or update `drizzle.config.ts` if
you use a different local database connection.

Create `~/.gatorconfig.json` with the database URL:

```json
{
  "db_url": "postgres://postgres:postgres@localhost:5432/gator?sslmode=disable"
}
```

Apply the database migrations:

```sh
npx drizzle-kit migrate
```

Start the CLI with npm:

```sh
npm start -- <command> [arguments]
```

## Commands

Register and select a user:

```sh
npm start -- register alice
npm start -- login alice
```

Manage feeds:

```sh
npm start -- addfeed "TechCrunch" https://techcrunch.com/feed/
npm start -- feeds
npm start -- follow https://techcrunch.com/feed/
npm start -- following
npm start -- unfollow https://techcrunch.com/feed/
```

Run the aggregator continuously. The duration controls the delay between
requests:

```sh
npm start -- agg 1m
```

Stop the aggregator with Ctrl+C. Browse the latest posts from feeds followed
by the current user:

```sh
npm start -- browse
npm start -- browse 10
```

The default browse limit is 2 posts.
