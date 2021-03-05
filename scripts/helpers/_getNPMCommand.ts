import concurrently from 'concurrently';
import Randoma from 'randoma';
import { green, red } from 'chalk';

const { scope } = require('minimist')(process.argv.slice(2));
const random = new Randoma({ seed: Math.ceil(Math.random() * 10) });
const { microservices } = require('../../package.json');

interface ConcurrentlyConfig {
  command: string;
  name: string;
  prefixColor: string;
}

const getConfig = (commandString: string) => (
  microservice: string
): ConcurrentlyConfig => ({
  command: `${commandString} --prefix ${microservice}`,
  name: microservice,
  prefixColor: random.color(0.5).hex().toString(),
});

const filterIfArgs = (list: string[]): string[] => {
  if (scope) {
    const microserviceList = scope.replace(/\s+/g, '').split(',');
    return list.filter((microservice) =>
      microserviceList.includes(microservice)
    );
  }

  return list;
};

const concurrentProcesses = (command: string): ConcurrentlyConfig[] =>
  filterIfArgs(microservices).map(getConfig(command));

const getNPMCommand = (commandString: string) =>
  concurrently(concurrentProcesses(commandString)).then(
    ([
      {
        command: { name },
      },
    ]) => console.log(green(`${name}: ${commandString} successful`)),
    ([
      {
        command: { name },
      },
    ]) => console.log(red(`${name}: ${commandString} error`))
  );

export default getNPMCommand;
