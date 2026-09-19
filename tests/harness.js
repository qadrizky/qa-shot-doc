// Kerangka tes minimal: test(), expect(), dan pencatat hasil. Tanpa dependensi.
window.T = (function(){
  const cases = [];
  function test(group, name, fn){ cases.push({ group, name, fn }); }
  function fail(msg){ throw new Error(msg); }
  function show(v){ return typeof v === 'string' ? JSON.stringify(v) : String(v); }
  function expect(actual){
    return {
      toBe(expected){ if(actual !== expected) fail('diharapkan ' + show(expected) + ', didapat ' + show(actual)); },
      toBeTrue(){ if(actual !== true) fail('diharapkan true, didapat ' + show(actual)); },
      toBeFalse(){ if(actual !== false) fail('diharapkan false, didapat ' + show(actual)); },
      toContain(part){ if(!String(actual).includes(part)) fail(show(actual) + ' tidak memuat ' + show(part)); },
      toBeAtLeast(min){ if(!(actual >= min)) fail('diharapkan >= ' + min + ', didapat ' + show(actual)); }
    };
  }
  async function run(groups, onResult){
    const results = [];
    for(const c of cases.filter(c => groups.includes(c.group))){
      const started = performance.now();
      let error = null;
      try{ await c.fn(); }catch(e){ error = e.message || String(e); }
      const r = { group:c.group, name:c.name, ok:!error, error, ms:Math.round(performance.now() - started) };
      results.push(r); onResult(r);
    }
    return results;
  }
  return { test, expect, run };
})();

// Pembuat hasil OCR tiruan untuk tes unit. Koordinat dalam piksel layar 1080×2400.
// row(y, h, x, teks): satu baris OCR; kata-kata diberi lebar ±16 px per huruf.
window.OCR = (function(){
  const CHAR_W = 16, SPACE = 10;
  function row(y, h, x, text){
    const words = [];
    for(const t of text.split(' ')){
      const w = t.length * CHAR_W;
      words.push({ t, b:{ x0:x, y0:y, x1:x + w, y1:y + h } });
      x += w + SPACE;
    }
    return words;
  }
  function screen(...rows){
    const lines = rows.map((ws, li) => ws.map(w => ({ ...w, li })));
    return { name:'tiruan.png', _ocr:{ w:1080, h:2400, lines }, _photos:[] };
  }
  const words = text => text.split(' ').map(t => ({ t }));
  return { row, screen, words };
})();
