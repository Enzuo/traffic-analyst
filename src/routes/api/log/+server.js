import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'logs/performance.log');

export async function POST({ request }) {
  const { text } = await request.json();
  const logEntry = text //`${text}\n`;

  return new Promise((resolve, reject) => {
    fs.writeFile(logFile, logEntry, (err) => {
      if (err) {
        console.error('Error writing to log file', err);
        reject(json({ message: 'Error logging performance data' }, { status: 500 }));
      } else {
        resolve(json({ message: 'Performance data logged' }));
      }
    });
  });
}
