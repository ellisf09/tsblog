import { readConfig, setUser } from "./config.js";
import { getUser } from "./lib/db/queries/users.js";
import type { User } from "./lib/db/schema.js";

export type CommandHandler = (
  cmdName: string,
  ...args: string[]
) => Promise<void>;

export type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>;

export function middlewareLoggedIn(
  handler: UserCommandHandler,
): CommandHandler {
  return async (cmdName: string, ...args: string[]): Promise<void> => {
    const cfg = readConfig();

    if (!cfg.currentUserName) {
      throw new Error("no user is logged in");
    }

    const user = await getUser(cfg.currentUserName);

    if (!user) {
      throw new Error("current user not found");
    }

    await handler(cmdName, user, ...args);
  };
}

export function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler,
): void {
  registry[cmdName] = handler;
}

export async function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const handler = registry[cmdName];

  if (!handler) {
    throw new Error(`Unknown command: ${cmdName}`);
  }

  await handler(cmdName, ...args);
}

export async function handlerLogin(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error("the login command requires a username");
  }

  const userName = args[0];
  const user = await getUser(userName);

  if (!user) {
    throw new Error(`user ${userName} does not exist`);
  }

  const cfg = readConfig();
  setUser(cfg, user.name);

  console.log(`User has been set to ${user.name}`);
}
