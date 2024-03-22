import SkyCliHelper from 'sky-cli-helper'

if (require.main === module) {
  main()
    .then(() => {
      SkyCliHelper.println('sky-env-generator ended...')
    })
    .catch(console.error)
}

async function main() {
  SkyCliHelper.println('sky-env-generator starting...')
  SkyCliHelper.println('Which process do you want?')
  const processMake = 'Make sky.env.config.js'
  const processGenerate = 'Generate env by sky.env.config.js'

  const answer = await SkyCliHelper.select([processGenerate, processMake], {
    vertical: true,
    selectPrinter: SkyCliHelper.Text.Foreground.Cyan,
    unselectPrinter: SkyCliHelper.Text.Foreground.Gray,
  })

  if (answer.item === processMake) {
    await makeSkyEnvConfig()
  }
  if (answer.item === processGenerate) {
    // return await generateEnv()
    console.log(answer)
  }
  throw new Error('failed to find process')
}
