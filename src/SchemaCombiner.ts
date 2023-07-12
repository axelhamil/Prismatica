import * as fs from 'fs';
import * as path from 'path';
import { IConfig } from "./types";

export class SchemaCombiner {
  public readonly outputSchemaFile: string;
  public readonly projectRoot: string;
  
  constructor(config: IConfig) {
    this.outputSchemaFile = path.resolve(process.cwd(), config.outputSchemaFile);
    this.projectRoot = process.cwd();
  }
  
  async combineSchemas(changedFilePath?: string) {
    const schemaFiles = await this.getSchemaFiles(this.projectRoot);
    let combinedSchema = '';
    
    for (const file of schemaFiles) {
      const filePath = path.resolve(this.projectRoot, file);
      
      if (file !== 'schema.prisma') {
        const schema = await fs.promises.readFile(filePath, 'utf8');
        const fileComment = `// Source: ${file}\n`;
        
        combinedSchema += fileComment + schema + '\n\n';
      }
    }
    
    await fs.promises.writeFile(this.outputSchemaFile, combinedSchema);
    
    console.log('Successfully combined schemas!')
  }
  
  private async getSchemaFiles(dir: string, relativePath = ''): Promise<string[]> {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    
    let files: string[] = [];
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativeFilePath = path.join(relativePath, entry.name);
      
      if (entry.isFile() && entry.name.endsWith('.prisma') && fullPath !== this.outputSchemaFile) {
        files.push(relativeFilePath);
      } else if (entry.isDirectory()) {
        files = files.concat(await this.getSchemaFiles(fullPath, relativeFilePath));
      }
    }
    
    return files;
  }
}
