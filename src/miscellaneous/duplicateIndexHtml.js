const fs = require('fs');

// File destination.txt will be created or overwritten by default.
fs.copyFile('build/index.html', 'build/404.html', (err) => {
  if (err) throw err;
  console.log('source.txt was copied to destination.txt');
});