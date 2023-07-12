import { getConfig } from './config';
import { SchemaCombiner } from './SchemaCombiner';

async function combine() {
  const config = getConfig();
  const schemaCombiner = new SchemaCombiner(config);
  
  await schemaCombiner.combineSchemas();
}

combine().catch(console.error);
