import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
  dbUrl: string;
  currentUserName: string;
};

type RawConfig = {
  db_url?: unknown;
  current_user_name?: unknown;
};

function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json");
}

function writeConfig(cfg: Config): void {
  const rawConfig: RawConfig = {
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName,
  };

  fs.writeFileSync(getConfigFilePath(), JSON.stringify(rawConfig, null, 2));
}

function validateConfig(rawConfig: any): Config {
  if (typeof rawConfig !== "object" || rawConfig === null) {
    throw new Error("Invalid config: expected a JSON object");
  }

  const config = rawConfig as RawConfig;

  if (typeof config.db_url !== "string") {
    throw new Error("Invalid config: db_url must be a string");
  }

  if (
    config.current_user_name !== undefined &&
    typeof config.current_user_name !== "string"
  ) {
    throw new Error("Invalid config: current_user_name must be a string");
  }

  return {
    dbUrl: config.db_url,
    currentUserName: config.current_user_name ?? "",
  };
}

export function readConfig(): Config {
  const filePath = getConfigFilePath();
  const data = fs.readFileSync(filePath, "utf-8");
  const rawConfig = JSON.parse(data);

  return validateConfig(rawConfig);
}

export function setUser(cfg: Config, userName: string): void {
  cfg.currentUserName = userName;
  writeConfig(cfg);
}
