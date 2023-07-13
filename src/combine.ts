import { getConfig } from './config';
import { SchemaCompiler } from './SchemaCompiler';

async function combine() {
  const config = getConfig();
  const schemaCombiner = new SchemaCompiler(config);
  
  await schemaCombiner.compileSchemas();
}

combine().catch(console.error);
