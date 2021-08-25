const _id = id => document.getElementById(id);
function el(p,...args) {
  if (p===null) {
    const x = args[0];
    if (x.constructor !== String) throw new Error('expected tag name');
    args.shift();
    p = document.createElement(x);
  }
  for (const x of args) {
    if (x.constructor === String) {
      p = p.appendChild( (p instanceof SVGElement || x==='svg')
        ? document.createElementNS('http://www.w3.org/2000/svg',x)
        : document.createElement(x)
      );
    } else if (x.constructor === Array) {
      p.classList.add(...x);
    } else if (x.constructor === Object) {
      for (const [key,val] of Object.entries(x))
        // p.style[key] = val;
        if (p instanceof SVGElement)
          p.setAttributeNS(null,key,val);
        else
          p.setAttribute(key,val);
    }
  }
  return p;
}
function clear(x) {
  for (let c; c = x.firstChild; ) x.removeChild(c);
  return x;
}
const round = x => x.toFixed(4).replace(/\.?0*$/,'');
const last = xs => xs[xs.length-1];
const rmws = s => s.replace(/\s+/g,'');

document.addEventListener('DOMContentLoaded', () => {
  const defs = _id('defs');
  defs.focus();
  defs.addEventListener('keypress',function(e) {
    if (e.keyCode == 13 && e.shiftKey) {
      e.preventDefault();
      let n = null, start = null, m = null, rules = { }, actions = { };
      for (let line of this.value.split('\n')) {
        line = line.trim();
        if (line.length===0) continue;
        if (n===null) {
          n = parseInt(line);
          if (isNaN(n) || n<0) {
            alert('Number of iterations must be a non-negative integer');
            return;
          }
        } else if (start===null) {
          start = rmws(line);
        } else if ((m = line.match(/(\S)\s*[=→]\s*(.+)/))) {
          rules[m[1]] = rmws(m[2]);
        } else if ((m = line.match(/(\S)\s*:\s*(.+)/))) {
          actions[m[1]] = m[3];
        } else {
          alert('Invalid input: '+line);
          return;
        }
      }
      if (start!==null) {
        console.log({start,rules});
        // apply rules and iterate
        let s = start, s2 = '';
        for (let i=0; i<n; ++i) {
          for (const c of s) {
            const r = rules[c];
            s2 += (r!==undefined ? r : c);
          }
          s = s2;
          s2 = '';
        }
        console.log(`Length: ${s.length}`);
        if (s.length < 200) console.log(s);

        // draw
        let x=0, y=0, a=0, d = 'M0,0';
        let xmin=0, xmax=0, ymin=0, ymax=0;
        const stack = [ ];
        for (const c of s) {
          if (c==='F') {
            const ad = a*Math.PI/180;
            x += Math.cos(ad);
            y += Math.sin(ad);
            if (x < xmin) xmin = x;
            if (x > xmax) xmax = x;
            if (y < ymin) ymin = y;
            if (y > ymax) ymax = y;
            d += ` ${round(x)},${round(y)}`;
          } else if (c==='+') {
            a += 90;
          } else if (c==='-') {
            a -= 90;
          }
        }
        const w = Math.max(xmax-xmin,ymax-ymin)/500;
        el(clear(_id('fig')),'svg',{
          'viewBox': `${round(xmin)} ${round(ymin-w/2)} ` +
                     `${round(xmax-xmin)} ${round(ymax-ymin+w)}`,
          'width': '100%',
          'height': '100%'
        },'path',{
          d,
          'stroke': '#000',
          'stroke-width': w,
          'fill': 'none'
        });
      }
    }
  });
});
