import * as fs from "fs";
import * as path from "path";

export class FileSystemUtils {
  static async readFile(filePath: string): Promise<string> {
    return fs.promises.readFile(filePath, 'utf8');
  }
  
  static async writeFile(filePath: string, content: string): Promise<void> {
    await fs.promises.writeFile(filePath, content);
  }
  
  static async readdir(dir: string): Promise<fs.Dirent[]> {
    return fs.promises.readdir(dir, { withFileTypes: true });
  }
  
  static async getFilesOfTypeInDirectory(dir: string, fileType: string, excludeFilePath?: string, relativePath = ''): Promise<string[]> {
    const entries = await this.readdir(dir);
    
    const files = await Promise.all(entries.map(entry => this.processEntry(entry, dir, fileType, excludeFilePath, relativePath)));
    
    return files.flat();
  }
  
  private static async processEntry(entry: fs.Dirent, dir: string, fileType: string, excludeFilePath?: string, relativePath = ''): Promise<string[]> {
    const fullPath = path.join(dir, entry.name);
    const relativeFilePath = path.join(relativePath, entry.name);
    
    if (this.isFileOfType(entry, fileType, fullPath, excludeFilePath)) {
      return [relativeFilePath];
    } else if (entry.isDirectory()) {
      return this.getFilesOfTypeInDirectory(fullPath, fileType, excludeFilePath, relativeFilePath);
    }
    
    return [];
  }
  
  private static isFileOfType(entry: fs.Dirent, fileType: string, filePath: string, excludeFilePath?: string): boolean {
    return entry.isFile() && entry.name.endsWith(fileType) && filePath !== excludeFilePath;
  }
}
