import { getConfig } from './config';
import { SchemaCompiler } from './SchemaCompiler';
import { Watcher } from './Watcher';

async function combineWatch() {
  const config = getConfig();
  const schemaCombiner = new SchemaCompiler(config);
  const watcher = new Watcher(schemaCombiner, config);
  await watcher.watch();
}

combineWatch().catch(console.error);
