import chalk from 'chalk'

export function format(time) {
  return time.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
}

function run(fn, options = {
  silent: false,
  showStats: true,
  autoOpenBrowser: true,
}) {
  const task = typeof fn.default === 'undefined' ? fn : fn.default;
  const start = new Date();
  !options.silent && console.info(
    `[${chalk.green(format(start))}] Starting '${chalk.green(task.name)}'...`,
  );
  return task(options).then(resolution => {
    const end = new Date();
    const time = end.getTime() - start.getTime();
    !options.silent &&  console.info(
      `[${chalk.green(format(end))}] Finished '${chalk.green(task.name)}' after ${chalk.green(time)} ms`,
    );
    return resolution;
  });
}

// this module was run directly from the command line as in node xxx.js
if (require.main === module && process.argv.length > 2) {
  // eslint-disable-next-line no-underscore-dangle
  delete require.cache[__filename];

  // eslint-disable-next-line global-require, import/no-dynamic-require
  const module = require(`./${process.argv[2]}.js`).default;

  run(module).catch(err => {
    console.error(err.stack);
    process.exit(1);
  });
}

export default run;
