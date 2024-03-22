import fs from 'node:fs'
import path from 'node:path'

const rootdirPath = process.cwd()
const configfilePath = path.resolve(rootdirPath, 'sky.env.config.js')

async function isExists() {
  try {
    await fs.promises.access(
      configfilePath,
      fs.constants.R_OK | fs.constants.W_OK,
    )
    return true
  } catch {
    return false
  }
}
