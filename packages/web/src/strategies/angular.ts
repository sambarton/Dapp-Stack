import * as child_process from 'child_process'
import * as spawn from 'cross-spawn'
import * as path from 'path'
import { Signale } from 'signale'

import { IWebFrameworkStrategy } from '../types'

const angularCliPath = path.resolve(process.cwd(), 'node_modules', '.bin', 'ng')

export class Angular implements IWebFrameworkStrategy {
  private readonly signale: Signale
  private child!: child_process.ChildProcess

  constructor(signale: Signale) {
    this.signale = signale
  }

  start = () => {
    this.signale.await('Starting angular...')
    this.child = spawn('node', [angularCliPath, 'serve', '-o'], {
      stdio: 'pipe'
    })
    this.child.stderr.on('data', (data: Buffer) => {
      data
        .toString('utf-8')
        .trim()
        .split('\n')
        .forEach(line => this.signale.error(line))
    })
    this.child.stdout.on('data', (data: Buffer) => {
      data
        .toString('utf-8')
        .trim()
        .split('\n')
        .forEach(line => this.signale.info(line))
    })
  }

  build = () => {
    this.signale.await('Building angular...')
    this.child = spawn('node', [angularCliPath, 'build'], { stdio: 'pipe' })
    this.child.stderr.on('data', (data: Buffer) => {
      data
        .toString('utf-8')
        .trim()
        .split('\n')
        .forEach(line => this.signale.error(line))
    })
    this.child.stdout.on('data', (data: Buffer) => {
      data
        .toString('utf-8')
        .trim()
        .split('\n')
        .forEach(line => this.signale.info(line))
    })

    return new Promise<void>(resolve => {
      this.child.on('exit', () => {
        resolve()
      })
    })
  }

  stop = () => {
    this.child && this.child.kill()
  }
}
