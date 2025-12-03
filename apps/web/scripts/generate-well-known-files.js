import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// VERCEL_ENV for Vercel, RAILWAY_ENVIRONMENT_NAME for Railway
const railwayEnv =
  process.env.RAILWAY_ENVIRONMENT_NAME === 'production'
    ? 'production'
    : process.env.RAILWAY_ENVIRONMENT_NAME
      ? 'preview'
      : undefined
const environment = process.env.VERCEL_ENV || railwayEnv || 'development'
console.log(`Generating .well-known files for ${environment} environment`)

const appleSourceFile = path.join(__dirname, '../public/.well-known/apple-app-site-association.' + environment)
const appleDestinationFile = path.join(__dirname, '../public/.well-known/apple-app-site-association.json')

if (!fs.existsSync(appleSourceFile)) {
  console.error(`Apple source file ${appleSourceFile} does not exist!`)
  process.exit(1)
}

fs.copyFileSync(appleSourceFile, appleDestinationFile)
console.log(`Successfully generated apple-app-site-association file for ${environment}`)

const androidSourceFile = path.join(__dirname, '../public/.well-known/assetlinks.' + environment + '.json')
const androidDestinationFile = path.join(__dirname, '../public/.well-known/assetlinks.json')

if (!fs.existsSync(androidSourceFile)) {
  console.error(`Android source file ${androidSourceFile} does not exist!`)
  process.exit(1)
}

fs.copyFileSync(androidSourceFile, androidDestinationFile)
console.log(`Successfully generated assetlinks.json file for ${environment}`)
