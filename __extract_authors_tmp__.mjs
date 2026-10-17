
import { authorProfiles } from './src/data/authorProfiles.ts';
import fs from 'node:fs';
fs.writeFileSync('__authors_tmp__.json', JSON.stringify(authorProfiles, null, 2));
