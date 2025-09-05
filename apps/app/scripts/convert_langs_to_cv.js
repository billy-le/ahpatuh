import fs from 'node:fs';

fs.readFile('scripts/languages.txt', (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  const languages = data
    .toString()
    .split('\n')
    .map((language) => language.replace(' ', ','))
    .join('\n');

  fs.writeFile('scripts/languages.csv', 'value,name\n' + languages, (err) => {
    if (err) {
      console.log(err);
    }
  });
});
