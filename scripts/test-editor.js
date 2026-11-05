const assert = require('node:assert/strict');
const { init } = require('../media/js/admin-import.js');

function field(value = '') { return { value }; }
function row(values = {}) {
  const fields = Object.fromEntries(Object.entries(values).map(([name, value]) => [name, field(value)]));
  return {
    fields,
    querySelector(selector) {
      const name = selector.match(/\[([a-z_]+)\]"\]$/)?.[1] || selector.match(/\[([a-z_]+)\]/)?.[1];
      if (!fields[name]) fields[name] = field();
      return fields[name];
    },
  };
}
function subform() {
  const rows = [];
  return {
    getRows: () => [...rows],
    addRow: () => { const item = row(); rows.push(item); return item; },
    removeRow: (item) => rows.splice(rows.indexOf(item), 1),
  };
}
function element() {
  return { children: [], textContent: '', handlers: {}, append(child) { this.children.push(child); },
    replaceChildren() { this.children = []; }, addEventListener(name, handler) { this.handlers[name] = handler; },
    setAttribute(name, value) { this[name] = value; } };
}

const forms = { sections: subform(), members: subform(), legend: subform() };
const elements = {
  'roster-import-run': { ...element(), disabled: true },
  'roster-preview-run': { ...element(), disabled: true },
  'roster-import-status': element(),
  'roster-import-text': { value: 'Flutes\nTaylor Reed*\nAvery Chen\n\nOboe\nMorgan Hall\n\n*Principal' },
  'roster-import-file': { files: [] },
  'roster-preview': element(),
  'jform_params_page_title': { value: 'Roster' },
  'jform_params_member_order': { value: 'last_name' },
};
global.document = {
  getElementById: (id) => elements[id] || null,
  querySelector: (selector) => Object.entries(forms).find(([name]) => selector.includes(`[${name}]`))?.[1] || null,
  createElement: element,
};

async function main() {
  init();
  assert.equal(elements['roster-import-run'].disabled, false);
  assert.equal(elements['roster-preview-run'].disabled, false);
  assert.match(elements['roster-import-status'].textContent, /Importer ready/);
  await elements['roster-import-run'].handlers.click();
  assert.equal(forms.sections.getRows().length, 2);
  assert.equal(forms.members.getRows().length, 3);
  assert.equal(forms.legend.getRows().length, 1);
  assert.match(elements['roster-import-status'].textContent, /^Imported 3 assignment/);
  await elements['roster-import-run'].handlers.click();
  assert.equal(forms.members.getRows().length, 3, 'A second import must not create duplicates');
  elements['roster-preview-run'].handlers.click();
  const fluteNames = elements['roster-preview'].children[2].children.map((item) => item.textContent);
  assert.deepEqual(fluteNames, ['Avery Chen', '* Taylor Reed']);
  elements['roster-import-text'].value = 'Name,Section,Flags\n"Broken, Name",Flutes';
  await elements['roster-import-run'].handlers.click();
  assert.match(elements['roster-import-status'].textContent, /columns; expected 3/);
  assert.equal(elements['roster-import-status'].className, 'roster-import-error');
  assert.equal(forms.members.getRows().length, 3, 'A failed import must leave the editor intact');
  elements['roster-import-text'].value = '';
  elements['roster-import-file'].files = [{ name: 'roster.csv', text: async () => { throw new Error('read failed'); } }];
  await elements['roster-import-run'].handlers.click();
  assert.match(elements['roster-import-status'].textContent, /Could not read the selected file/);
  assert.equal(elements['roster-import-status'].className, 'roster-import-error');
  console.log('Editor import and preview wiring OK');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
