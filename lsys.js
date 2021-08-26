const _id = id => document.getElementById(id);
function el(p,...args) {
  if (p===null) {
    if (args[0].constructor !== String) throw new Error('expected tag name');
    p = document.createElement(args.shift());
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
      for (const [key,val] of Object.entries(x)) {
        if (p instanceof SVGElement)
          p.setAttributeNS(null,key,val);
        else
          p.setAttribute(key,val);
      }
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

let px, py, ang, svg, path;
let xmin, xmax, ymin, ymax;
const stack = [ ];

const action_functions = {
  'move': (args) => {
    const d = args.length===0 ? 1 : parseFloat(args);
    if (isNaN(d)) throw new Error('move [distance]');
    return () => {
      const ad = ang*Math.PI/180;
      px += d*Math.cos(ad);
      py += d*Math.sin(ad);
      if (px < xmin) xmin = px;
      if (px > xmax) xmax = px;
      if (py < ymin) ymin = py;
      if (py > ymax) ymax = py;
      path += ` ${round(px)},${round(py)}`;
    };
  },
  'turn': (args) => {
    const a = parseFloat(args);
    if (isNaN(a)) throw new Error('turn angle');
    return () => { ang += a; };
  },
  'push': (args) => {
    if (args.length!==0) throw new Error('push');
    return () => { stack.push([px,py,ang]); };
  },
  'pop': (args) => {
    if (args.length!==0) throw new Error('pop');
    return () => {
      el(svg,'path',{ 'd': path });
      [px,py,ang] = stack.pop();
      path = `M${round(px)},${round(py)}`;
    };
  },
};

let defs;
function draw() {
  let n = null, start = null, m = null, rules = { }, actions = { };
  for (let line of defs.value.split('\n')) {
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
    } else if ((m = line.match(/(\S)\s*:\s*([^\s,]+)[\s,]*(.*)/))) {
      const f = action_functions[m[2]];
      if (f===undefined) {
        alert('Undefined function: '+line);
        return;
      }
      try {
        actions[m[1]] = f(m[3]);
      } catch (e) {
        alert(`${e.name}: ${e.message}`);
        return;
      }
    } else {
      alert('Invalid input: '+line);
      return;
    }
  }
  if (start!==null) {
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
    px=0; py=0; ang=0; path='M0,0';
    xmin=0; xmax=0; ymin=0; ymax=0;
    svg = el(clear(_id('fig')),'svg',{
      'width': document.body.clientWidth,
      'stroke': '#000',
      'fill': 'none'
    });
    for (const c of s) {
      const a = actions[c];
      if (a!==undefined) a();
    }
    const w = Math.max(xmax-xmin,ymax-ymin)/500;
    el(svg,{
      'viewBox': `${round(xmin)} ${round(ymin-w/2)} ` +
                 `${round(xmax-xmin)} ${round(ymax-ymin+w)}`,
      'stroke-width': w,
    },'path',{
      'd': path
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  defs = _id('defs');
  defs.focus();
  defs.addEventListener('keypress',function(e) {
    if (e.keyCode == 13 && e.shiftKey) {
      e.preventDefault();
      draw();
    }
  });
  _id('enter').addEventListener('click',draw);
});
