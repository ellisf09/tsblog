import { readConfig, setUser } from "../config.js";
import {
  createUser,
  deleteAllUsers,
  getUsers,
} from "../lib/db/queries/users.js";

export async function handlerRegister(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error("the register command requires a username");
  }

  const userName = args[0];
  const user = await createUser(userName);

  const cfg = readConfig();
  setUser(cfg, user.name);

  console.log(`User ${user.name} has been created`);
}

export async function handlerReset(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  await deleteAllUsers();
  console.log("Database reset successfully");
}

export async function handlerUsers(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const allUsers = await getUsers();
  const cfg = readConfig();

  for (const user of allUsers) {
    const current = user.name === cfg.currentUserName ? " (current)" : "";
    console.log(`* ${user.name}${current}`);
  }
}
