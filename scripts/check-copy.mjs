// Checks the words: no dashes, no banned phrases, no exclamation marks in the laptop's voice.
// Copy is a deliverable here (docs/ANTI-SLOP.md section 2), so CI fails on it like it fails on code.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const textExtensions = new Set(['.html', '.css', '.js', '.mjs', '.md', '.txt', '.json', '.yml', '.svg']);
const skippedDirectories = new Set(['node_modules', '.git']);
const dashes = /[\u2014\u2013]/;

const problems = [];

function listFiles(directory) {
  let entries;
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return skippedDirectories.has(entry.name) ? [] : listFiles(full);
    return [full];
  });
}

function isFile(file) {
  try {
    return statSync(file).isFile();
  } catch {
    return false;
  }
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function report(file, line, rule, found) {
  problems.push(`${file}:${line}  ${rule}  ${found}`);
}

function exclamationLines(text) {
  const lines = [];
  let line = 1;
  let quote = null;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (quote) {
      if (c === '\\') {
        if (next === '\n') line++;
        i++;
      } else if (c === quote) {
        quote = null;
      } else if (c === '!') {
        lines.push(line);
      } else if (c === '\n') {
        line++;
        if (quote !== '`') quote = null;
      }
    } else if (c === '/' && next === '/') {
      while (i + 1 < text.length && text[i + 1] !== '\n') i++;
    } else if (c === '/' && next === '*') {
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) {
        if (text[i] === '\n') line++;
        i++;
      }
      i++;
    } else if (c === '"' || c === "'" || c === '`') {
      quote = c;
    } else if (c === '\n') {
      line++;
    }
  }
  return lines;
}

const bannedPhrases = readFileSync(path.join(root, 'scripts', 'banned-words.txt'), 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))
  .map((phrase) => ({
    phrase,
    pattern: new RegExp(`(?<![\\w])${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w])`, 'i'),
  }));

function isLaptopVoiceFile(name) {
  return (name.startsWith('site/js/personalities/') && name.endsWith('.js')) || name === 'site/js/script.js';
}

const candidates = [
  ...['site', 'docs', 'scripts', 'tests'].flatMap((directory) => listFiles(path.join(root, directory))),
  ...['README.md', 'CLAUDE.md'].map((name) => path.join(root, name)).filter(isFile),
];

for (const file of candidates) {
  const name = relative(file);
  if (!textExtensions.has(path.extname(file))) continue;
  if (path.basename(file) === 'package-lock.json' || name === 'scripts/banned-words.txt') continue;

  const lines = readFileSync(file, 'utf8').split('\n');

  if (name !== 'docs/ANTI-SLOP.md') {
    lines.forEach((text, index) => {
      const dash = text.match(dashes);
      if (dash) report(name, index + 1, 'no-dashes', `U+${dash[0].codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`);
    });
  }

  if (name.startsWith('site/') || name === 'README.md') {
    lines.forEach((text, index) => {
      for (const { phrase, pattern } of bannedPhrases) {
        if (pattern.test(text)) report(name, index + 1, 'banned-words', `"${phrase}"`);
      }
    });
  }

  if (isLaptopVoiceFile(name)) {
    for (const line of exclamationLines(lines.join('\n'))) {
      report(name, line, 'no-exclamation-in-laptop-voice', lines[line - 1].trim());
    }
  }
}

if (problems.length) {
  console.log(problems.join('\n'));
  console.log(`${problems.length} problems`);
  process.exit(1);
}
console.log('ok: check-copy');
