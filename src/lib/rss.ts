import { XMLParser } from "fast-xml-parser";

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string | null;
};

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const response = await fetch(feedURL, {
    headers: {
      "User-Agent": "gator",
    },
  });

  const xmlText = await response.text();

  const parser = new XMLParser({ processEntities: false });
  const parsed = parser.parse(xmlText);

  if (!parsed.rss || !parsed.rss.channel) {
    throw new Error("Invalid RSS feed: missing channel");
  }

  const channel = parsed.rss.channel;

  if (!isNonEmptyString(channel.title) || !isNonEmptyString(channel.link)) {
    throw new Error("Invalid RSS feed: missing required channel fields");
  }

  const items: RSSItem[] = [];

  if (channel.item !== undefined) {
    const rawItems = Array.isArray(channel.item) ? channel.item : [channel.item];

    for (const rawItem of rawItems) {
      if (typeof rawItem !== "object" || rawItem === null) {
        continue;
      }

      const item = rawItem as Record<string, unknown>;

      if (!isNonEmptyString(item.title) || !isNonEmptyString(item.link)) {
        continue;
      }

      const description = isNonEmptyString(item.description)
        ? item.description
        : "";
      const pubDate = [
        item.pubDate,
        item["dc:date"],
        item.published,
        item.updated,
      ].find(isNonEmptyString);

      items.push({
        title: item.title,
        link: item.link,
        description,
        pubDate: pubDate ?? null,
      });
    }
  }

  return {
    channel: {
      title: channel.title,
      link: channel.link,
      description: isNonEmptyString(channel.description)
        ? channel.description
        : "",
      item: items,
    },
  };
}

export function parsePublishedAt(pubDate: string | null): Date | null {
  if (!pubDate) {
    return null;
  }

  const publishedAt = new Date(pubDate);
  return Number.isNaN(publishedAt.getTime()) ? null : publishedAt;
}
