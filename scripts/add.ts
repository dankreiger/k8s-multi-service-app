#!/usr/bin/env node
import { green, cyan, yellow } from 'chalk';
import getNPMCommand from './helpers/_getNPMCommand';
const { microservices } = require('../../package.json');

let {
  _: depsArr,
  dev: devDepsString,
  scope: microserviceName,
} = require('minimist')(process.argv.slice(2));

const depsString = depsArr.join(', ');
if (!microserviceName) {
  microserviceName = microservices.join(', ');
}

const prepare = ({
  depsString,
  isDev,
}: {
  depsString: string;
  isDev?: boolean;
}) => {
  const msg = `${green(depsString)} to ${cyan(microserviceName)}`;
  const deps = depsString.replace(',', ' ');

  console.log(`┏━━━ 🏗️  ADD${isDev ? ' (DEV)' : ''}: ${msg} ━━━━━━━\n`);
  console.log(yellow('please wait...\n'));

  getNPMCommand(`npm install --save${isDev ? '-dev' : ''} ${deps}`);
};

if (depsString.length) {
  prepare({ depsString });
}
if (devDepsString?.length) {
  prepare({ depsString: devDepsString, isDev: true });
}
