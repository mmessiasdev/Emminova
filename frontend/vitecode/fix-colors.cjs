const fs = require('fs');
const path = require('path');

const DIR = 'c:\\dev\\Emminova\\front\\vitecode\\src\\system\\system\\components\\template-editor';

const replacements = [
  { rx: /bg-white\/\[0\.0[234]\]/g, val: 'bg-muted/40' },
  { rx: /bg-white\/\[0\.0[56]\]/g, val: 'bg-muted/60' },
  { rx: /bg-white\/\[0\.08\]/g, val: 'bg-muted' },
  { rx: /hover:bg-white\/10/g, val: 'hover:bg-muted' },
  { rx: /hover:bg-white\/\[0\.0[68]\]/g, val: 'hover:bg-muted/80' },
  { rx: /border-white\/\[?0\.0[468]\]?/g, val: 'border-border' },
  { rx: /border-white\/10/g, val: 'border-border' },
  { rx: /hover:border-white\/\[0\.1\]/g, val: 'hover:border-primary/50' },
  { rx: /text-white\/40/g, val: 'text-muted-foreground/40' },
  { rx: /text-white\/60/g, val: 'text-muted-foreground/60' },
  { rx: /text-white\/80/g, val: 'text-muted-foreground/80' },
  { rx: /text-white\/20/g, val: 'text-muted-foreground/20' },
  { rx: /bg-\[\#0a0a0f\]/g, val: 'bg-background' },
  { rx: /bg-\[\#0e0e15\]/g, val: 'bg-card' },
  { rx: /bg-\[\#111118\]/g, val: 'bg-background' },
  { rx: /bg-white\/5/g, val: 'bg-border' }
];

let changedFiles = 0;

fs.readdirSync(DIR).forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(DIR, file);
    let originalContent = fs.readFileSync(filePath, 'utf8');
    let content = originalContent;
    
    replacements.forEach(r => {
      content = content.replace(r.rx, r.val);
    });
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      changedFiles++;
    }
  }
});
console.log(`Corrigido classes em ${changedFiles} arquivos.`);
