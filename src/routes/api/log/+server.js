import { parseLog, stringifyPerfLog, stringifyPerfLogEntry } from '@/debug/logger/Logger'
import { json } from '@sveltejs/kit'
import fs from 'fs'
import path from 'path'

const logFile = path.join(process.cwd(), 'logs/performance.log')

export async function POST({ request }) {
  const { logEntry } = await request.json()

  const logData = fs.readFileSync(logFile, 'utf-8')
  const logFileEntries = parseLog(logData)

  var logFileEntryIndex = logFileEntries.findIndex((l) => l.identifier === logEntry.identifier)
  if (logFileEntryIndex >= 0) {
    logFileEntries[logFileEntryIndex] = logEntry
  }
  else {
    logFileEntries.push(logEntry)
  }

  try {
    var writeData = stringifyPerfLog(logFileEntries)
    fs.writeFileSync(logFile, writeData)
  }
  catch(err){
    console.error('Error writing to log file', err)
    return json({ message: 'Error logging performance data' }, { status: 500 })
  }
  return json({ message: 'Performance data logged' })

}
