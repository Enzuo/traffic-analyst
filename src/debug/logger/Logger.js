
export function addPerfLog(name, avg, max, min) {
  const logEntry = {
    identifier : name,
    avg_frame_time : avg,
    min_frame_time : min,
    max_frame_time : max,
  }

  var data = { logEntry }
  fetch('/api/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
}

export function parseLog(log) {
  var logEntries = log.split('\n')
  return logEntries.map((l) => parseLogEntry(l)).filter(Boolean)
}

function parseLogEntry(logEntry) {
  if (!logEntry) {
    return
  }
  // Split the log entry into the identifier and the key-value pairs
  const [identifier, keyValuePairs] = logEntry.trim().split(/\s+(.+)/)

  // Split the key-value pairs into an array
  const pairs = keyValuePairs.split(', ')

  // Create an object to store the parsed data
  const parsedData = { identifier }

  // Iterate over the pairs and add them to the parsedData object
  pairs.forEach((pair) => {
    const [key, value] = pair.split('=')
    parsedData[key.trim()] = value
  })

  return parsedData
}

// TODO make more generic
function stringifyPerfLogEntry(logEntry) {
  const normalizedName = logEntry.identifier.padEnd(20, ' ')
  const avg_frame_time = msToString(logEntry.avg_frame_time)
  const min_frame_time = msToString(logEntry.min_frame_time)
  const max_frame_time = msToString(logEntry.max_frame_time)
  const text = `${normalizedName} avg_frame_time=${avg_frame_time}, min_frame_time=${min_frame_time}, max_frame_time=${max_frame_time}`

  return text
}

export function stringifyPerfLog(logEntries){
  var logData = logEntries.map(l => stringifyPerfLogEntry(l)).join('\n')
  return logData
}


function msToString(value){
  if(typeof value === 'string'){
    return value
  }

  return value.toFixed(2).padStart(5, ' ') + 'ms'
}