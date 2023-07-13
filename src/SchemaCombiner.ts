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
        if (schema.trim().length === 0) continue;
        const fileComment = `// Source: ${file}\n`;
        
        combinedSchema += fileComment + schema + '\n';
      }
    }
    
    const outputContent = `// WARNING: Do not modify this file directly.\n\n${combinedSchema}`;
    
    await fs.promises.writeFile(this.outputSchemaFile, outputContent);
    
    console.log('Successfully combined schemas!')
  }
  
  async updateSchema(changedFilePath: string) {
    const schemaFiles = await this.getSchemaFiles(this.projectRoot);
    const outputSchemaFile = await fs.promises.readFile(this.outputSchemaFile, 'utf8');
    
    const outputBlockLength = this.extractSchemasInFile(outputSchemaFile).length;
    let schemaBlockLength = 0;
    
    for (const file of schemaFiles) {
      const filePath = path.resolve(this.projectRoot, file);
      
      if (filePath === changedFilePath) {
        const schemaFile = await fs.promises.readFile(filePath, 'utf8');
        const extractedSchema = this.extractSchemasInFile(schemaFile);
        schemaBlockLength += extractedSchema.length;
        
        extractedSchema.forEach(schema => {
          
          const oldBlock = this.extractBlockByName(outputSchemaFile, this.getSchemaName(schema));
          
          if (oldBlock === schema) return;
          
          const newSchema = outputSchemaFile.replace(oldBlock, schema + '\n\n');
          
          fs.promises.writeFile(this.outputSchemaFile, newSchema);
          
          console.log('Successfully updated schemas!')
        })
      }
    }
    
    if (outputBlockLength !== schemaBlockLength) {
      await this.combineSchemas();
    }
  }
  
  private getSchemaName(schemaBlock: string): string {
    const schemaNameRegex = /\b(\w+)\s+(\w+)\s*{[^}]*}/;
    const schemaName = schemaBlock.match(schemaNameRegex) || [];
    return schemaName[2] || "";
  }
  
  private extractBlockByName(schemaFile: string, blockName: string): string {
    const schemaRegex = new RegExp(`(\\b\\w+\\b)\\s+${blockName}\\s*{[^}]*}`, 's');
    const match = schemaFile.match(schemaRegex);
    return match ? match[0] : "";
  }
  
  private extractSchemasInFile(schemaFile: string): string[] {
    const schemaRegex = /(\w+)\s+(\w+)\s*{[^}]*}/gs;
    const schemaBlocks = schemaFile.match(schemaRegex) || [];
    return schemaBlocks;
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
