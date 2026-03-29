import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/text-black(?!\/)/g, 'text-black dark:text-white');
  content = content.replace(/text-black\/([0-9]+)/g, 'text-black/$1 dark:text-white/$1');
  
  content = content.replace(/bg-white(?!\/)/g, 'bg-white dark:bg-neutral-950');
  content = content.replace(/bg-white\/([0-9]+)/g, 'bg-white/$1 dark:bg-neutral-950/$1');
  
  content = content.replace(/border-black(?!\/)/g, 'border-black dark:border-white');
  content = content.replace(/border-black\/([0-9]+)/g, 'border-black/$1 dark:border-white/$1');
  
  content = content.replace(/bg-gray-50(?!\/)/g, 'bg-gray-50 dark:bg-neutral-900');
  content = content.replace(/border-gray-100(?!\/)/g, 'border-gray-100 dark:border-neutral-800');
  content = content.replace(/border-gray-200(?!\/)/g, 'border-gray-200 dark:border-neutral-700');
  
  content = content.replace(/bg-orange-50(?!\/)/g, 'bg-orange-50 dark:bg-orange-950/30');
  content = content.replace(/bg-orange-100(?!\/)/g, 'bg-orange-100 dark:bg-orange-900/40');
  content = content.replace(/text-orange-600(?!\/)/g, 'text-orange-600 dark:text-orange-400');
  content = content.replace(/text-orange-700(?!\/)/g, 'text-orange-700 dark:text-orange-300');
  content = content.replace(/border-orange-100(?!\/)/g, 'border-orange-100 dark:border-orange-900/50');
  
  content = content.replace(/shadow-sm(?!\/)/g, 'shadow-sm dark:shadow-none');
  
  fs.writeFileSync(file, content, 'utf8');
});
console.log('Dark mode classes added');
