(function () {
  'use strict';

  const key = (value) => String(value || '').trim().toLocaleLowerCase();
  const lines = (value) => String(value || '').split(/\r\n|\r|\n/).map((part) => part.trim()).filter(Boolean);

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;
    const source = String(text).replace(/^\uFEFF/, '');

    for (let i = 0; i < source.length; i += 1) {
      const char = source[i];
      if (char === '"') {
        if (quoted && source[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else if (!quoted && cell.trim() !== '') {
          throw new Error('Invalid CSV quote.');
        } else {
          quoted = !quoted;
        }
      } else if (char === ',' && !quoted) {
        row.push(cell.trim());
        cell = '';
      } else if ((char === '\n' || char === '\r') && !quoted) {
        if (char === '\r' && source[i + 1] === '\n') i += 1;
        row.push(cell.trim());
        if (row.some(Boolean)) rows.push(row);
        row = [];
        cell = '';
      } else {
        cell += char;
      }
    }
    if (quoted) throw new Error('CSV has an unclosed quoted field.');
    row.push(cell.trim());
    if (row.some(Boolean)) rows.push(row);
    if (!rows.length) throw new Error('The file is empty.');

    const header = rows.shift().map(key);
    const nameIndex = header.indexOf('name');
    const sectionIndex = header.indexOf('section');
    const flagsIndex = header.indexOf('flags');
    if (nameIndex < 0 || sectionIndex < 0 || flagsIndex < 0) {
      throw new Error('CSV header must contain Name, Section, Flags.');
    }

    const entries = [];
    rows.forEach((fields, index) => {
      const name = (fields[nameIndex] || '').trim();
      const section = (fields[sectionIndex] || '').trim();
      if (!name || !section) throw new Error(`CSV row ${index + 2} needs a name and section.`);
      section.split(';').map((part) => part.trim()).filter(Boolean).forEach((heading) => {
        entries.push({ name, section: heading, mark: (fields[flagsIndex] || '').trim() });
      });
    });
    return { entries, legend: [] };
  }

  function parseFlat(text) {
    const entries = [];
    const sections = [];
    const legend = [];
    let section = '';
    String(text).replace(/^\uFEFF/, '').split(/\r\n|\r|\n/).forEach((source) => {
      const line = source.trim();
      if (!line) return;
      const heading = line.match(/^\*\*(.+?)\*\*$/);
      if (heading) {
        section = heading[1].trim();
        if (section) sections.push(section);
        return;
      }
      const escapedLegend = line.match(/^\*\\\*(.+?)\*$/);
      if (escapedLegend) {
        legend.push({ mark: '*', meaning: escapedLegend[1].trim() });
        return;
      }
      const plain = line.replace(/\\([*†‡§])/g, '$1');
      const definition = plain.match(/^([*†‡§]+)\s*(?:=|:|-)?\s*(.+)$/);
      if (definition && (source.startsWith('*') || source.startsWith('\\*'))) {
        const meaning = definition[2].replace(/\*$/, '').trim();
        if (meaning) legend.push({ mark: definition[1], meaning });
        return;
      }
      if (!section) throw new Error('Add a **Section** heading before the first member.');
      const marked = plain.match(/^(.*?)\s*([*†‡§]+)$/);
      const name = marked ? marked[1].trim() : plain;
      if (name) entries.push({ name, section, mark: marked ? marked[2] : '' });
    });
    if (!sections.length) throw new Error('No **Section** headings found.');
    return { entries, sections, legend };
  }

  function merge(existing, incoming) {
    const sections = [];
    const members = [];
    const legend = [];
    const addSection = (heading) => {
      const found = sections.find((item) => key(item) === key(heading));
      if (found) return found;
      const clean = String(heading).trim();
      sections.push(clean);
      return clean;
    };
    [...existing.sections, ...(incoming.sections || [])].forEach(addSection);
    existing.members.forEach((member) => {
      const name = String(member.name || '').trim();
      if (!name) return;
      let target = members.find((item) => key(item.name) === key(name));
      if (!target) {
        target = { name, mark: member.mark || '', sections: [] };
        members.push(target);
      }
      lines(member.sections).forEach((heading) => {
        const canonical = sections.find((item) => key(item) === key(heading)) || heading;
        if (!target.sections.some((item) => key(item) === key(canonical))) target.sections.push(canonical);
      });
    });
    incoming.entries.forEach((entry) => {
      const canonical = addSection(entry.section);
      let target = members.find((item) => key(item.name) === key(entry.name));
      if (!target) {
        target = { name: entry.name, mark: '', sections: [] };
        members.push(target);
      }
      target.mark = entry.mark;
      if (!target.sections.some((item) => key(item) === key(canonical))) target.sections.push(canonical);
    });
    [...existing.legend, ...(incoming.legend || [])].forEach((entry) => {
      const index = legend.findIndex((item) => key(item.mark) === key(entry.mark));
      if (index < 0) legend.push({ mark: entry.mark, meaning: entry.meaning });
      else legend[index].meaning = entry.meaning;
    });
    return { sections, members, legend };
  }

  function subform(name) {
    return document.getElementById(`jform_params_${name}`);
  }

  function field(row, name) {
    return row.querySelector(`[name$="[${name}]"]`);
  }

  function getRows(element) {
    if (!element || typeof element.getRows !== 'function') throw new Error('Joomla roster fields are not ready.');
    return element.getRows();
  }

  function readEditor() {
    const sectionRows = getRows(subform('sections'));
    const memberRows = getRows(subform('members'));
    const legendRows = getRows(subform('legend'));
    return {
      sections: sectionRows.map((row) => field(row, 'heading')?.value.trim()).filter(Boolean),
      members: memberRows.map((row) => ({
        name: field(row, 'name')?.value.trim() || '',
        mark: field(row, 'mark')?.value.trim() || '',
        sections: field(row, 'sections')?.value || '',
      })).filter((member) => member.name),
      legend: legendRows.map((row) => ({
        mark: field(row, 'mark')?.value.trim() || '',
        meaning: field(row, 'meaning')?.value.trim() || '',
      })).filter((entry) => entry.mark && entry.meaning),
    };
  }

  function replaceRows(element, values, fill) {
    getRows(element).forEach((row) => element.removeRow(row));
    values.forEach((value) => {
      const row = element.addRow();
      if (!row) throw new Error('Joomla reached the maximum number of roster rows.');
      fill(row, value);
    });
  }

  function writeEditor(data) {
    replaceRows(subform('sections'), data.sections, (row, heading) => { field(row, 'heading').value = heading; });
    replaceRows(subform('members'), data.members, (row, member) => {
      field(row, 'name').value = member.name;
      field(row, 'mark').value = member.mark;
      field(row, 'sections').value = member.sections.join('\n');
    });
    replaceRows(subform('legend'), data.legend, (row, entry) => {
      field(row, 'mark').value = entry.mark;
      field(row, 'meaning').value = entry.meaning;
    });
  }

  function preview(data) {
    const root = document.getElementById('roster-preview');
    root.replaceChildren();
    const title = document.getElementById('jform_params_page_title')?.value.trim();
    const addText = (parent, tag, text) => {
      const element = document.createElement(tag);
      element.textContent = text;
      parent.append(element);
      return element;
    };
    if (title) addText(root, 'h2', title);
    data.sections.forEach((heading) => {
      addText(root, 'h3', heading);
      const list = document.createElement('ul');
      data.members.filter((member) => lines(member.sections).some((section) => section === heading))
        .forEach((member) => addText(list, 'li', `${member.mark ? `${member.mark} ` : ''}${member.name}`));
      root.append(list);
    });
    if (data.legend.length) {
      const block = document.createElement('div');
      block.className = 'roster-preview-legend';
      data.legend.forEach((entry) => addText(block, 'div', `${entry.mark} ${entry.meaning}`));
      root.append(block);
    }
  }

  function init() {
    const run = document.getElementById('roster-import-run');
    if (!run) return;
    const status = document.getElementById('roster-import-status');
    run.addEventListener('click', async () => {
      try {
        const pasted = document.getElementById('roster-import-text').value.trim();
        const file = document.getElementById('roster-import-file').files[0];
        const source = pasted || (file ? await file.text() : '');
        if (!source.trim()) throw new Error('Paste roster text or choose a file first.');
        const imported = /^\s*(?:\uFEFF)?"?name"?\s*,/i.test(source) ? parseCsv(source) : parseFlat(source);
        const combined = merge(readEditor(), imported);
        writeEditor(combined);
        preview(combined);
        status.textContent = `Imported ${imported.entries.length} assignment(s). Review the roster, then save the module.`;
      } catch (error) {
        status.textContent = error.message;
      }
    });
    document.getElementById('roster-preview-run').addEventListener('click', () => {
      try {
        preview(readEditor());
        status.textContent = 'Preview updated from the current editor values.';
      } catch (error) {
        status.textContent = error.message;
      }
    });
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { parseCsv, parseFlat, merge };
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', init);
}());
