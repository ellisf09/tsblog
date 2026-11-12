import {
  createFeed,
  createFeedFollow,
  deleteFeedFollow,
  getAllFeeds,
  getFeedByUrl,
  getFeedFollowsForUser,
  getNextFeedToFetch,
  markFeedFetched,
} from "../lib/db/queries/feeds.js";
import { createPost } from "../lib/db/queries/posts.js";
import type { Feed, User } from "../lib/db/schema.js";
import { fetchFeed, parsePublishedAt } from "../lib/rss.js";

function printFeed(feed: Feed, user: User): void {
  console.log(`Feed: ${feed.name}`);
  console.log(`URL: ${feed.url}`);
  console.log(`User: ${user.name}`);
}

export async function handlerAgg(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length !== 1) {
    throw new Error("the agg command requires a time_between_reqs duration");
  }

  const timeBetweenRequests = parseDuration(args[0]);
  console.log(
    `Collecting feeds every ${formatDuration(timeBetweenRequests)}`,
  );

  await scrapeFeeds().catch(handleError);

  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, timeBetweenRequests);

  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("Shutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
}

export function parseDuration(durationStr: string): number {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);

  if (!match) {
    throw new Error(
      "invalid duration: expected a number followed by ms, s, m, or h",
    );
  }

  const value = Number(match[1]);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error("invalid duration: duration must be a positive integer");
  }

  const multipliers = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
  } as const;
  const unit = match[2] as keyof typeof multipliers;

  return value * multipliers[unit];
}

function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h${minutes}m${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m${seconds}s`;
  }

  return `${seconds}s`;
}

export async function scrapeFeeds(): Promise<void> {
  const feed = await getNextFeedToFetch();

  if (!feed) {
    return;
  }

  console.log(`Fetching feed: ${feed.name} (${feed.url})`);
  const fetchedFeed = await fetchFeed(feed.url);
  await markFeedFetched(feed.id);

  for (const item of fetchedFeed.channel.item) {
    await createPost(
      item.title,
      item.link,
      item.description,
      parsePublishedAt(item.pubDate),
      feed.id,
    );
  }
}

function handleError(err: unknown): void {
  console.error(err instanceof Error ? err.message : String(err));
}

export async function handlerAddFeed(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length < 2) {
    throw new Error("the addfeed command requires a name and url");
  }

  const [name, url] = args;

  const feed = await createFeed(name, url, user.id);
  const feedFollow = await createFeedFollow(user.id, feed.id);

  printFeed(feed, user);
  console.log(`Following: ${feedFollow.feedName}`);
  console.log(`User: ${feedFollow.userName}`);
}

export async function handlerFeeds(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const allFeeds = await getAllFeeds();

  for (const feed of allFeeds) {
    console.log(`Feed: ${feed.feedName}`);
    console.log(`URL: ${feed.feedUrl}`);
    console.log(`User: ${feed.userName}`);
    console.log();
  }
}

export async function handlerFollow(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error("the follow command requires a url");
  }

  const url = args[0];
  const feed = await getFeedByUrl(url);

  if (!feed) {
    throw new Error(`feed not found: ${url}`);
  }

  const feedFollow = await createFeedFollow(user.id, feed.id);
  console.log(`Following: ${feedFollow.feedName}`);
  console.log(`User: ${feedFollow.userName}`);
}

export async function handlerFollowing(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  const feedFollows = await getFeedFollowsForUser(user.id);

  for (const feedFollow of feedFollows) {
    console.log(`Feed: ${feedFollow.feedName}`);
  }
}

export async function handlerUnfollow(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error("the unfollow command requires a url");
  }

  const url = args[0];
  await deleteFeedFollow(user.id, url);
  console.log(`Unfollowed feed: ${url}`);
}
