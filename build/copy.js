import path from 'path'
import chalk from 'chalk'
import chokidar from 'chokidar'
import { writeFile, copyFile, makeDir, copyDir, cleanDir } from './lib/fs'
import pkg from '../package.json'
import { format } from './run'

const handleErr = err => console.error(chalk.yellow(err.message))

/**
 * Copies static files such as robots.txt, favicon.ico to the
 * output (dist) folder.
 */
async function copy() {
  await makeDir('dist')
  await Promise.all([
    writeFile(
      'dist/package.json',
      JSON.stringify(
        {
          private: true,
          engines: pkg.engines,
          dependencies: pkg.dependencies,
          scripts: {
            start: 'node server.js',
          },
        },
        null,
        2,
      ),
    ).catch(handleErr),
    copyFile('LICENSE.txt', 'dist/LICENSE.txt').catch(handleErr),
    copyFile('yarn.lock', 'dist/yarn.lock').catch(handleErr),
    copyDir('static', 'dist/static').catch(handleErr),
  ])

  if (process.argv.includes('--watch')) {
    const watcher = chokidar.watch(['static/**/*'], { ignoreInitial: true })

    watcher.on('all', async (event, filePath) => {
      const start = new Date()
      const src = path.relative('./', filePath)
      const dist = path.join(
        'dist/',
        src.startsWith('src') ? path.relative('src', src) : src,
      )
      switch (event) {
        case 'add':
        case 'change':
          await makeDir(path.dirname(dist)).catch(handleErr)
          await copyFile(filePath, dist).catch(handleErr)
          break
        case 'unlink':
        case 'unlinkDir':
          cleanDir(dist, { nosort: true, dot: true }).catch(handleErr)
          break
        default:
          return
      }
      const end = new Date()
      const time = end.getTime() - start.getTime()
      console.info(`[${format(end)}] ${event} '${dist}' after ${time} ms`)
    })
  }
}

export default copy
