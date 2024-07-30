var logs = []

export function addPerfLog(name, avg, max, min) {
  // var normalizedName = ''
  const normalizedName = name.padEnd(20, ' ')
  const avg_frame_time = avg.toFixed(2).padStart(5, ' ')
  const min_frame_time = min.toFixed(2).padStart(5, ' ')
  const max_frame_time = max.toFixed(2).padStart(5, ' ')
  const text = `${normalizedName} avg_frame_time=${avg_frame_time}ms, min_frame_time=${min_frame_time}ms, max_frame_time=${max_frame_time}ms`
  console.log(text)
  logs.push(text)

  logs.sort()

  var data = { text : logs.join('\n') }
  fetch('/api/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
}
