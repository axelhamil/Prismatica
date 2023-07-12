import { SchemaCombiner } from "./SchemaCombiner";
import { IConfig } from "./types";
import * as fs from 'fs';

export class Watcher {
  private readonly schemaCombiner: SchemaCombiner;
  private readonly watchPattern: string;
  private readonly projectRoot: string;
  private readonly watchRegex: RegExp;
  
  constructor(schemaCombiner: SchemaCombiner, config: IConfig) {
    this.schemaCombiner = schemaCombiner;
    this.watchPattern = config.watchPattern;
    this.projectRoot = schemaCombiner.projectRoot;
    this.watchRegex = this.convertToRegex(config.watchPattern);
  }
  
  private convertToRegex(globPattern: string): RegExp {
    const escapedPattern = globPattern.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
      .replace(/\\\*\\\*/g, '.+?')
      .replace(/\\\*/g, '[^/]*');
    return new RegExp(`^${escapedPattern}$`);
  }
  
  async watch() {
    await this.schemaCombiner.combineSchemas();
    
    fs.watch(this.projectRoot, { recursive: true }, async (eventType, filename) => {
      if (!filename || !this.watchRegex.test(filename) || filename === "prisma/schema.prisma") {
        return;
      }
      
      if (eventType === "change") {
        const filePath = `${this.projectRoot}/${filename}`;
        await this.schemaCombiner.combineSchemas(filePath);
      }
    });
  }
}
