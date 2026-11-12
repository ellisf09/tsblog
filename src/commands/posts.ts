import { getPostsForUser } from "../lib/db/queries/posts.js";
import type { User } from "../lib/db/schema.js";

export async function handlerBrowse(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length > 1) {
    throw new Error("the browse command accepts an optional limit");
  }

  const limit = args.length === 0 ? 2 : parseLimit(args[0]);
  const posts = await getPostsForUser(user.id, limit);

  for (const post of posts) {
    console.log(`Title: ${post.title}`);
    console.log(`URL: ${post.url}`);
    console.log(`Description: ${post.description}`);
    console.log(
      `Published: ${post.publishedAt?.toISOString() ?? "unknown"}`,
    );
    console.log();
  }
}

function parseLimit(value: string): number {
  if (!/^\d+$/.test(value)) {
    throw new Error("the browse limit must be a positive integer");
  }

  const limit = Number(value);
  if (!Number.isSafeInteger(limit) || limit <= 0) {
    throw new Error("the browse limit must be a positive integer");
  }

  return limit;
}
