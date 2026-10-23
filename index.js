/**
 * Host half of the 带派 desk-pet bundle.
 *
 * One long-lived PowerShell worker owns the sound player and waits on stdin, so
 * a click only writes a line instead of paying the ~1s process start every time.
 */
import { spawn } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const VOICE_FILE = path.join(HERE, 'assets', 'voice-source.wav');
const LOG_FILE = path.join(HERE, 'events.log');
const THROTTLE_MS = 1000;

export const inject = ['webServer'];

const POWERSHELL = process.env.SystemRoot
  ? path.join(process.env.SystemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
  : 'powershell.exe';

let lastPlayedAt = 0;
let player = null;
const seenTypes = new Set();

function log(line) {
  try {
    appendFileSync(LOG_FILE, `${new Date().toISOString()} ${line}\n`, 'utf8');
  } catch (error) {
    // Logging must never break the plugin.
  }
}

function workerScript() {
  const file = VOICE_FILE.replace(/'/g, "''");
  return [
    "$ErrorActionPreference = 'SilentlyContinue'",
    `$p = New-Object System.Media.SoundPlayer '${file}'`,
    '$p.Load()',
    "Write-Output 'player-ready'",
    'while ($true) {',
    '  $line = [Console]::In.ReadLine()',
    '  if ($null -eq $line) { break }',
    '  $cmd = $line.Trim()',
    "  if ($cmd -eq 'quit') { break }",
    "  if ($cmd -eq 'play') { $p.Play(); Write-Output 'played' }",
    '}',
  ].join('\n');
}

function ensurePlayer() {
  if (player && player.exitCode === null && !player.killed) return player;
  const child = spawn(POWERSHELL, ['-NoProfile', '-NonInteractive', '-Command', workerScript()], {
    windowsHide: true,
  });
  child.stdout.on('data', (chunk) => log(`ps-out ${String(chunk).trim().slice(0, 120)}`));
  child.stderr.on('data', (chunk) => log(`ps-err ${String(chunk).trim().slice(0, 160)}`));
  child.on('error', (error) => log(`player-error ${error && error.message}`));
  child.on('exit', (code) => {
    log(`player-exit code=${code}`);
    if (player === child) player = null;
  });
  player = child;
  return child;
}

function playVoice(source) {
  const now = Date.now();
  if (now - lastPlayedAt < THROTTLE_MS) {
    log(`play-skipped (throttle) source=${source}`);
    return;
  }
  lastPlayedAt = now;
  log(`play-request source=${source}`);

  const child = ensurePlayer();
  if (!child || !child.stdin || child.stdin.destroyed) {
    log('player-unavailable');
    return;
  }
  try {
    child.stdin.write('play\n');
  } catch (error) {
    log(`write-error ${error && error.message}`);
  }
}

export function apply(ctx) {
  log('apply');
  ensurePlayer();

  ctx.effect(() => () => {
    if (player) {
      try {
        player.stdin.write('quit\n');
      } catch (error) {
        // Already gone.
      }
      try {
        player.kill();
      } catch (error) {
        // Already gone.
      }
      player = null;
    }
  });

  ctx.effect(() => {
    try {
      return ctx.webServer.register({
        kind: 'exact',
        path: '/jiejie-pet/play',
        handler: (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end();
            return;
          }
          log('route POST /jiejie-pet/play');
          playVoice('client-click');
          res.statusCode = 204;
          res.end();
        },
      });
    } catch (error) {
      log('route-error ' + String((error && error.stack) || error));
      throw error;
    }
  });

  ctx.on('session/event', (session, event) => {
    const type = event && event.type;
    if (!seenTypes.has(type)) {
      seenTypes.add(type);
      log(`session/event type=${String(type)}`);
    }
    if (typeof type === 'string' && /turn/i.test(type) && /(end|stop|complete|finish)/i.test(type)) {
      playVoice(type);
    }
  });

  ctx.on('agent/turn-stopping', () => playVoice('turn-stopping'));
}
