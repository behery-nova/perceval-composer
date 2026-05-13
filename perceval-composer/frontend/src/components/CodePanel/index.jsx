// CodePanel/index.jsx — Syntax-highlighted Perceval Python code panel
import { useRef } from 'react';
import { useCircuitStore } from '../../store/circuitStore';

// Simple tokenizer for Python syntax highlighting (no external dep needed)
function highlight(code) {
  const keywords = /\b(import|from|as|def|class|return|for|in|if|else|elif|while|with|try|except|pass|and|or|not|None|True|False|lambda|yield|async|await)\b/g;
  const builtins = /\b(print|len|range|str|int|float|list|dict|set|type|isinstance)\b/g;
  const strings  = /("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')/g;
  const comments = /(#[^\n]*)/g;
  const numbers  = /\b(\d+\.?\d*)\b/g;
  const funcs    = /\b([a-z_][a-z0-9_]*)\s*(?=\()/gi;

  // Order matters — process strings and comments first to avoid double-replacing
  let result = code
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Use placeholders to protect already-escaped content
  const placeholders = [];
  const ph = (html) => { const i = placeholders.length; placeholders.push(html); return `\x00${i}\x00`; };

  result = result
    .replace(strings,  (m) => ph(`<span class="tok-string">${m}</span>`))
    .replace(comments, (m) => ph(`<span class="tok-comment">${m}</span>`))
    .replace(numbers,  (m) => ph(`<span class="tok-number">${m}</span>`))
    .replace(keywords, (m) => ph(`<span class="tok-keyword">${m}</span>`))
    .replace(builtins, (m) => ph(`<span class="tok-builtin">${m}</span>`))
    .replace(funcs,    (m) => ph(`<span class="tok-func">${m}</span>`));

  // Restore placeholders
  result = result.replace(/\x00(\d+)\x00/g, (_, i) => placeholders[parseInt(i)]);
  return result;
}

export default function CodePanel() {
  const generatedCode = useCircuitStore((s) => s.generatedCode);
  const codeRef = useRef(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    const btn = document.getElementById('copy-btn');
    if (btn) { btn.textContent = '✓ Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 2000); }
  };

  return (
    <div className="code-panel">
      <div className="panel-header">
        <span className="panel-title">
          <span className="panel-title-icon">🐍</span> Generated Python
        </span>
        <button id="copy-btn" className="btn-ghost" onClick={handleCopy}>Copy</button>
      </div>
      <div className="code-scroll" ref={codeRef}>
        <pre className="code-pre">
          <code
            dangerouslySetInnerHTML={{ __html: highlight(generatedCode) }}
          />
        </pre>
      </div>
    </div>
  );
}
