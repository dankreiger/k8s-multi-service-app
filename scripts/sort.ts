#!/usr/bin/env node
import { cyan } from 'chalk';
import getNPMCommand from './helpers/_getNPMCommand';

console.log(cyan('┏━━━ 📊 SORT: organize all package.json files ━━━━━━━\n'));
const sort = () => {
  getNPMCommand('npm run sort');
};

export default sort();
