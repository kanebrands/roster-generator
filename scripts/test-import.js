const assert = require('node:assert/strict');
const { parseCsv, parseFlat, merge } = require('../media/js/admin-import.js');

const flat = parseFlat('**Flutes**\nJane Smith\\*\n\n**Oboe**\nJane Smith\n*\\*Principal*');
assert.equal(flat.entries.length, 2);
assert.deepEqual(flat.entries[0], { name: 'Jane Smith', section: 'Flutes', mark: '*' });
assert.deepEqual(flat.legend, [{ mark: '*', meaning: 'Principal' }]);

const plain = parseFlat('Director\nDr. Avery Hall\n\nFlutes\nMorgan Reed*\nTaylor Quinn\n\nConcert Support Team\nCasey Brooks**\n\n*Principal\n**Operations Lead');
assert.deepEqual(plain.sections, ['Director', 'Flutes', 'Concert Support Team']);
assert.equal(plain.entries.length, 4);
assert.deepEqual(plain.entries[1], { name: 'Morgan Reed', section: 'Flutes', mark: '*' });
assert.deepEqual(plain.entries[3], { name: 'Casey Brooks', section: 'Concert Support Team', mark: '**' });
assert.deepEqual(plain.legend, [
  { mark: '*', meaning: 'Principal' },
  { mark: '**', meaning: 'Operations Lead' },
]);
assert.deepEqual(parseFlat('**Empty Section**').sections, ['Empty Section']);
assert.throws(() => parseFlat('Flutes\nAvery Chen***'), /supports \*, \*\*,/);

const csv = parseCsv('Name,Section,Flags\n"Smith, Jane",Flutes,*\n"Smith, Jane",Oboe,**\n');
assert.equal(csv.entries[0].name, 'Smith, Jane');
assert.equal(csv.entries.length, 2);
assert.throws(() => parseCsv('Name,Section,Flags\nAvery,Flutes,*,extra'), /columns; expected 3/);
assert.throws(() => parseCsv('Name,Section,Flags'), /no member rows/);

const merged = merge(
  { sections: ['Flutes'], members: [{ name: 'Jane Smith', mark: '', sections: 'Flutes' }], legend: [] },
  { sections: ['flutes', 'Oboe'], entries: [
    { name: 'jane smith', section: 'flutes', mark: '*' },
    { name: 'Jane Smith', section: 'Oboe', mark: '**' },
  ], legend: [{ mark: '*', meaning: 'Principal' }] },
);
assert.deepEqual(merged.sections, ['Flutes', 'Oboe']);
assert.equal(merged.members.length, 1);
assert.deepEqual(merged.members[0].sections, ['Flutes', 'Oboe']);
assert.equal(merged.members[0].mark, '**');

const twice = merge(merged, { sections: plain.sections, entries: plain.entries, legend: plain.legend });
const thrice = merge(twice, { sections: plain.sections, entries: plain.entries, legend: plain.legend });
assert.deepEqual(thrice, twice);

const { compareLastName } = require('../media/js/admin-import.js');
const sorted = [{ name: 'Taylor Quinn' }, { name: 'Avery Hall' }, { name: 'Morgan Reed' }].sort(compareLastName);
assert.deepEqual(sorted.map((member) => member.name), ['Avery Hall', 'Taylor Quinn', 'Morgan Reed']);

console.log('Import parser and duplicate merge OK');
