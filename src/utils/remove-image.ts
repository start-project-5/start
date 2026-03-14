import * as fs from 'fs';
import * as path from 'path';

/**
 * Safely removes a file from the filesystem.
 * Does not throw if the file doesn't exist.
 */
export function removeFile(filePath: string): void {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}