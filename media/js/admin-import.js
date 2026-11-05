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
    if (!rows.length) throw new Error('CSV has no member rows after the header.');

    const entries = [];
    rows.forEach((fields, index) => {
      if (fields.length !== header.length) {
        throw new Error(`CSV row ${index + 2} has ${fields.length} columns; expected ${header.length}. Quote names or sections that contain commas.`);
      }
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
    const blocks = String(text).replace(/^\uFEFF/, '').trim().split(/(?:\r\n|\r|\n)\s*(?:\r\n|\r|\n)/);

    blocks.forEach((block) => {
      const rows = lines(block);
      if (!rows.length) return;
      if (rows.some((line) => /^\*{3,}/.test(line) || /\*{3,}$/.test(line))) {
        throw new Error('Sectioned text supports *, **, †, ‡, or § flags. Use CSV for other flag text.');
      }

      const markdownHeading = rows.length === 1 && /^\*\*(.+?)\*\*$/.test(rows[0]);
      if (markdownHeading) {
        sections.push(rows[0].slice(2, -2).trim());
        return;
      }

      const definitions = rows.map((line) => {
        const escaped = line.match(/^\*\\\*(.+?)\*$/);
        if (escaped) return { mark: '*', meaning: escaped[1].trim() };
        const plain = line.replace(/\\([*†‡§])/g, '$1');
        const match = plain.match(/^(\*{1,2}|[†‡§])\s*(?:=|:|-)?\s*(.+)$/);
        return match ? { mark: match[1], meaning: match[2].replace(/\*$/, '').trim() } : null;
      });

      if (definitions.every((entry) => entry && entry.meaning)) {
        legend.push(...definitions);
        return;
      }

      const heading = rows.shift().replace(/^\*\*(.+?)\*\*$/, '$1').replace(/^#{1,6}\s+/, '').trim();
      if (!heading) throw new Error('A section heading is missing.');
      sections.push(heading);

      rows.forEach((line) => {
        const definition = line.match(/^\*\\\*(.+?)\*$/);
        if (definition) {
          legend.push({ mark: '*', meaning: definition[1].trim() });
          return;
        }
        const legendLine = line.replace(/\\([*†‡§])/g, '$1').match(/^(\*{1,2}|[†‡§])\s*(?:=|:|-)?\s*(.+)$/);
        if (legendLine && /^[*†‡§\\]/.test(line)) {
          legend.push({ mark: legendLine[1], meaning: legendLine[2].replace(/\*$/, '').trim() });
          return;
        }
        const plain = line.replace(/\\([*†‡§])/g, '$1');
        const marked = plain.match(/^(.*?)\s*(\*{1,2}|[†‡§])$/);
        const name = marked ? marked[1].trim() : plain;
        if (name) entries.push({ name, section: heading, mark: marked ? marked[2] : '' });
      });
    });

    if (!sections.length) throw new Error('No section headings found. Separate sections with a blank line.');
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
    return document.querySelector(`joomla-field-subform[name="jform[params][${name}]"]`)
      || document.getElementById(`subfieldList_jform_params_${name}`)?.closest('joomla-field-subform');
  }

  function field(row, name) {
    return row.querySelector(`[name$="[${name}]"]`);
  }

  function getRows(element) {
    if (!element || typeof element.getRows !== 'function') {
      throw new Error('Roster editor fields did not load. Reload this page and try the import again.');
    }
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
    const setField = (row, name, value) => {
      const input = field(row, name);
      if (!input) throw new Error(`Roster editor field ${name} is unavailable. Reload the page and try again.`);
      input.value = value;
    };
    replaceRows(subform('sections'), data.sections, (row, heading) => { setField(row, 'heading', heading); });
    replaceRows(subform('members'), data.members, (row, member) => {
      setField(row, 'name', member.name);
      setField(row, 'mark', member.mark);
      setField(row, 'sections', member.sections.join('\n'));
    });
    replaceRows(subform('legend'), data.legend, (row, entry) => {
      setField(row, 'mark', entry.mark);
      setField(row, 'meaning', entry.meaning);
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
    const order = document.getElementById('jform_params_member_order')?.value || 'manual';
    data.sections.forEach((heading) => {
      addText(root, 'h3', heading);
      const list = document.createElement('ul');
      const members = data.members.filter((member) => lines(member.sections).some((section) => section === heading));
      if (order === 'last_name') members.sort(compareLastName);
      members
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

  function compareLastName(left, right) {
    const surname = (member) => member.name.trim().split(/\s+/).at(-1);
    return surname(left).localeCompare(surname(right), undefined, { sensitivity: 'base' })
      || left.name.localeCompare(right.name, undefined, { sensitivity: 'base' });
  }

  function init() {
    const run = document.getElementById('roster-import-run');
    if (!run) return;
    const status = document.getElementById('roster-import-status');
    const setStatus = (message, error = false) => {
      status.textContent = message;
      status.className = error ? 'roster-import-error' : '';
      status.setAttribute('role', error ? 'alert' : 'status');
    };
    run.disabled = false;
    document.getElementById('roster-preview-run').disabled = false;
    setStatus('Importer ready. Paste text or choose a file, then click Import into editor.');
    run.addEventListener('click', async () => {
      try {
        const pasted = document.getElementById('roster-import-text').value.trim();
        const file = document.getElementById('roster-import-file').files[0];
        let source = pasted;
        if (!source && file) {
          try { source = await file.text(); }
          catch (error) { throw new Error('Could not read the selected file. Try selecting it again or paste its contents.'); }
        }
        if (!source.trim()) throw new Error('Paste roster text or choose a file first.');
        const firstLine = source.replace(/^\uFEFF/, '').split(/\r\n|\r|\n/).find((line) => line.trim()) || '';
        const csv = (!pasted && file && /\.csv$/i.test(file.name))
          || /^\s*"?name"?\s*,/i.test(firstLine)
          || (firstLine.match(/,/g) || []).length >= 2;
        const imported = csv ? parseCsv(source) : parseFlat(source);
        const combined = merge(readEditor(), imported);
        writeEditor(combined);
        preview(combined);
        setStatus(`Imported ${imported.entries.length} assignment(s). Review the roster, then save the module.`);
      } catch (error) {
        setStatus(error.message || 'Import failed. Check the file format and try again.', true);
      }
    });
    document.getElementById('roster-preview-run').addEventListener('click', () => {
      try {
        preview(readEditor());
        setStatus('Preview updated from the current editor values.');
      } catch (error) {
        setStatus(error.message || 'Preview failed. Reload the page and try again.', true);
      }
    });
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { parseCsv, parseFlat, merge, compareLastName, init };
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
  }
}());
