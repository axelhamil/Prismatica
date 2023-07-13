export class SchemaParser {
  static extractNameFromBlock(schemaBlock: string): string {
    const schemaNameRegex = /\b(\w+)\s+(\w+)\s*{[^}]*}/;
    const schemaName = schemaBlock.match(schemaNameRegex) || [];
    return schemaName[2] || "";
  }
  
  static extractBlockFromSchema(schemaFile: string, blockName: string): string {
    const schemaRegex = new RegExp(`(\\b\\w+\\b)\\s+${blockName}\\s*{[^}]*}`, 's');
    const match = schemaFile.match(schemaRegex);
    return match ? match[0] : "";
  }
  
  static extractAllBlocksFromSchema(schemaFile: string): string[] {
    const schemaRegex = /(\w+)\s+(\w+)\s*{[^}]*}/gs;
    return schemaFile.match(schemaRegex) || [];
  }
}
