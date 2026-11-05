const assert = require('node:assert/strict');
const { parseCsv, parseFlat, merge } = require('../media/js/admin-import.js');

const flat = parseFlat('**Flutes**\nJane Smith\\*\n\n**Oboe**\nJane Smith\n*\\*Principal*');
assert.equal(flat.entries.length, 2);
assert.deepEqual(flat.entries[0], { name: 'Jane Smith', section: 'Flutes', mark: '*' });
assert.deepEqual(flat.legend, [{ mark: '*', meaning: 'Principal' }]);

const csv = parseCsv('Name,Section,Flags\n"Smith, Jane",Flutes,*\n"Smith, Jane",Oboe,**\n');
assert.equal(csv.entries[0].name, 'Smith, Jane');
assert.equal(csv.entries.length, 2);

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

console.log('Import parser and duplicate merge OK');
