import { SchemaCompiler } from "./SchemaCompiler";
import { IConfig } from "./types";
import * as fs from 'fs';

export class Watcher {
  private readonly schemaCombiner: SchemaCompiler;
  private readonly watchPattern: string;
  private readonly projectRoot: string;
  private readonly watchRegex: RegExp;
  
  constructor(schemaCombiner: SchemaCompiler, config: IConfig) {
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
    await this.schemaCombiner.compileSchemas();
    
    fs.watch(this.projectRoot, { recursive: true }, async (eventType, filename) => {
      if (!filename || !this.watchRegex.test(filename) || filename === "prisma/schema.prisma") {
        return;
      }
      
      if (eventType === "change" || eventType === "rename") {
        const filePath = `${this.projectRoot}/${filename}`;
        await this.schemaCombiner.updateSchema(filePath);
      }
    });
  }
}
