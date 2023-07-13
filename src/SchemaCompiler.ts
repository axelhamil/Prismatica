import * as path from 'path';
import { IConfig } from "./types";
import { SchemaParser } from "./SchemaParser";
import { FileSystemUtils } from "./FileSystem.utils";

export class SchemaCompiler {
  public readonly outputSchemaFilePath: string;
  public readonly projectRoot: string;
  
  constructor(config: IConfig) {
    this.outputSchemaFilePath = path.resolve(process.cwd(), config.outputSchemaFile);
    this.projectRoot = process.cwd();
  }
  
  async compileSchemas(): Promise<void> {
    const schemaFiles = await FileSystemUtils.getFilesOfTypeInDirectory(this.projectRoot, '.prisma', this.outputSchemaFilePath);
    let compiledSchema = '';
    
    for (const file of schemaFiles) {
      const filePath = path.resolve(this.projectRoot, file);
      
      if (file !== 'schema.prisma') {
        const schemaContent = await FileSystemUtils.readFile(filePath);
        if (schemaContent.trim().length === 0) continue;
        const fileComment = `// Source: ${file}\n`;
        
        compiledSchema += fileComment + schemaContent + '\n';
      }
    }
    
    const outputSchemaContent = `// WARNING: Do not modify this file directly.\n\n${compiledSchema}`;
    
    await FileSystemUtils.writeFile(this.outputSchemaFilePath, outputSchemaContent);
  }
  
  async updateSchema(changedFilePath: string): Promise<void> {
    const schemaFiles = await FileSystemUtils.getFilesOfTypeInDirectory(this.projectRoot, '.prisma', this.outputSchemaFilePath);
    const outputSchemaContent = await FileSystemUtils.readFile(this.outputSchemaFilePath);
    
    const outputSchemaBlockCount = SchemaParser.extractAllBlocksFromSchema(outputSchemaContent).length;
    let changedSchemaBlockCount = 0;
    
    for (const file of schemaFiles) {
      const filePath = path.resolve(this.projectRoot, file);
      
      if (filePath === changedFilePath) {
        const changedSchemaContent = await FileSystemUtils.readFile(filePath);
        const changedSchemaBlocks = SchemaParser.extractAllBlocksFromSchema(changedSchemaContent);
        changedSchemaBlockCount += changedSchemaBlocks.length;
        
        changedSchemaBlocks.forEach(changedSchemaBlock => {
          const existingBlock = SchemaParser.extractBlockFromSchema(outputSchemaContent, SchemaParser.extractNameFromBlock(changedSchemaBlock));
          
          if (existingBlock === changedSchemaBlock) return;
          
          const updatedSchemaContent = outputSchemaContent.replace(existingBlock, changedSchemaBlock + '\n\n');
          
          FileSystemUtils.writeFile(this.outputSchemaFilePath, updatedSchemaContent);
        });
      }
    }
    
    if (outputSchemaBlockCount !== changedSchemaBlockCount) {
      await this.compileSchemas();
    }
  }
}
