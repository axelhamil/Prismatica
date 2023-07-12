import { getConfig } from './config';
import { SchemaCombiner } from './SchemaCombiner';
import { Watcher } from './Watcher';

async function combineWatch() {
  const config = getConfig();
  const schemaCombiner = new SchemaCombiner(config);
  const watcher = new Watcher(schemaCombiner, config);
  watcher.watch();
}

combineWatch().catch(console.error);
