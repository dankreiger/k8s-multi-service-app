#!/usr/bin/env node
import { green, yellow } from 'chalk';
import getNPMCommand from './helpers/_getNPMCommand';

const postInstall = async () => {
  console.log(
    green('┏━━━ 🏗️ POSTINSTALL: microservice dependencies ━━━━━━━\n')
  );
  console.log(yellow('please wait...\n'));
  await getNPMCommand('npm install');

  console.log('\n');
  require('./sort');
};

export default postInstall();
