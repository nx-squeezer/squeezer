import { formatFiles, Tree } from '@nrwl/devkit';
import fetch from 'node-fetch-commonjs';

import { readRawCodecov, writeProjectsToCodecov } from '../core';

export default async function (tree: Tree) {
  writeProjectsToCodecov(tree);
  await formatFiles(tree);

  // Validate
  const response = await fetch(`https://api.codecov.io/validate`, { method: 'POST', body: readRawCodecov(tree) });
  if (response.ok) {
    console.log(`Codecov file was validated successfully`);
  } else {
    throw new Error(`Couldn't generate a valid Codecov file`);
  }
}
