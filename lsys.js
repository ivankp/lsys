const _id = id => document.getElementById(id);
function make(p,...args) {
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
        p.style[key] = val;
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

document.addEventListener('DOMContentLoaded', () => {
  const defs = _id('defs');
  defs.focus();
  defs.addEventListener('keypress',function(e) {
    if (e.keyCode == 13 && e.shiftKey) {
      e.preventDefault();
      let start = null;
      let rules = { };
      for (let line of this.value.split('\n')) {
        line = line.replace(/\s+/g,'');
        if (line.length===0) continue;
        if (start===null) {
          if (line.length===0 || line.includes(':')) {
            alert('Invalid start: '+line);
            return;
          }
          start = line;
        } else {
          const rule = line.split(':');
          if (rule.length!==2 || rule[0].length!==1 || rule[1].length===0) {
            alert('Invalid rule: '+line);
            return;
          }
          rules[rule[0]] = rule[1];
        }
      }
      if (start!==null) {
        console.log({start,rules});
        const svg = make(clear(_id('fig')),'svg');
      }
    }
  });
});
