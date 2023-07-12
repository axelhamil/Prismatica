import {IConfig} from "./types";
import * as path from "path";
import * as fs from "fs";

export const getConfig = (): IConfig => {
  const configPath = path.resolve(process.cwd(), 'prismatica.config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('prismatica.config.json is missing in the project root');
  }

  return JSON.parse(fs.readFileSync(configPath, 'utf8')) as IConfig;
};
