export interface Point {
  x: number;
  y: number;
}

export function parseTransform(transformStr: string): { translateX: number; translateY: number; scale: number } {
  let translateX = 0;
  let translateY = 0;
  let scale = 1;

  const translateMatch = transformStr.match(/translate\(([^,]+)[, ]+([^)]+)\)/);
  if (translateMatch) {
    translateX = parseFloat(translateMatch[1]);
    translateY = parseFloat(translateMatch[2]);
  }

  const scaleMatch = transformStr.match(/scale\(([^)]+)\)/);
  if (scaleMatch) {
    const s = parseFloat(scaleMatch[1]);
    if (!isNaN(s)) scale = s;
  }

  return { translateX, translateY, scale };
}

export function buildTransform(t: { translateX: number; translateY: number; scale: number; cx?: number; cy?: number }): string {
  const parts = [];
  if (t.translateX !== 0 || t.translateY !== 0) {
    parts.push(`translate(${t.translateX}, ${t.translateY})`);
  }
  if (t.scale !== 1) {
    if (t.cx !== undefined && t.cy !== undefined) {
      // Scale around center
      parts.push(`translate(${t.cx}, ${t.cy}) scale(${t.scale}) translate(${-t.cx}, ${-t.cy})`);
    } else {
      parts.push(`scale(${t.scale})`);
    }
  }
  return parts.join(' ');
}

export function translateElement(el: SVGElement, dx: number, dy: number) {
  const tagName = el.tagName.toLowerCase();
  
  if (tagName === 'line') {
    el.setAttribute('x1', String(parseFloat(el.getAttribute('x1') || '0') + dx));
    el.setAttribute('y1', String(parseFloat(el.getAttribute('y1') || '0') + dy));
    el.setAttribute('x2', String(parseFloat(el.getAttribute('x2') || '0') + dx));
    el.setAttribute('y2', String(parseFloat(el.getAttribute('y2') || '0') + dy));
  } else if (tagName === 'circle') {
    el.setAttribute('cx', String(parseFloat(el.getAttribute('cx') || '0') + dx));
    el.setAttribute('cy', String(parseFloat(el.getAttribute('cy') || '0') + dy));
  } else if (tagName === 'text') {
    const x = el.getAttribute('x');
    const y = el.getAttribute('y');
    if (x !== null && y !== null) {
      el.setAttribute('x', String(parseFloat(x) + dx));
      el.setAttribute('y', String(parseFloat(y) + dy));
    } else {
      applyTranslateTransform(el, dx, dy);
    }
  } else {
    // For path, rect, g, ellipse etc.
    applyTranslateTransform(el, dx, dy);
  }
}

function applyTranslateTransform(el: SVGElement, dx: number, dy: number) {
  const t = el.getAttribute('transform') || '';
  const match = t.match(/translate\(([-0-9.]+)[,\s]+([-0-9.]+)\)/);
  if (match) {
    const nx = parseFloat(match[1]) + dx;
    const ny = parseFloat(match[2]) + dy;
    const newT = t.replace(match[0], `translate(${nx}, ${ny})`);
    el.setAttribute('transform', newT);
  } else {
    el.setAttribute('transform', `translate(${dx}, ${dy}) ` + t);
  }
}

export function scaleElement(el: SVGElement, scaleFactor: number, cx: number, cy: number) {
  const tagName = el.tagName.toLowerCase();
  
  if (tagName === 'circle') {
    const r = parseFloat(el.getAttribute('r') || '0');
    el.setAttribute('r', String(Math.max(0.1, r * scaleFactor)));
  } else {
    const t = el.getAttribute('transform') || '';
    el.setAttribute('transform', `translate(${cx}, ${cy}) scale(${scaleFactor}) translate(${-cx}, ${-cy}) ` + t);
  }
}

export function getElementCenter(el: SVGElement): Point {
  if (el instanceof SVGGraphicsElement) {
    try {
      const bbox = el.getBBox();
      return {
        x: bbox.x + bbox.width / 2,
        y: bbox.y + bbox.height / 2
      };
    } catch {
      return { x: 0, y: 0 };
    }
  }
  return { x: 0, y: 0 };
}

export function scaleAxisElement(el: SVGElement, sx: number, sy: number) {
  const center = getElementCenter(el);
  const t = el.getAttribute('transform') || '';
  el.setAttribute('transform', `translate(${center.x}, ${center.y}) scale(${sx}, ${sy}) translate(${-center.x}, ${-center.y}) ` + t);
}

export function duplicateElement(el: SVGElement): SVGElement | null {
  if (!el.parentNode) return null;
  const clone = el.cloneNode(true) as SVGElement;
  // Offset slightly
  translateElement(clone, 10, 10);
  el.parentNode.insertBefore(clone, el.nextSibling);
  return clone;
}

export function getElementLabel(el: SVGElement, index: number): string {
  const tag = el.tagName.toLowerCase();
  let desc = '';
  if (tag === 'text' || tag === 'tspan') {
    desc = `"${(el.textContent || '').trim().slice(0, 15)}"`;
  } else if (tag === 'path') {
    const d = el.getAttribute('d') || '';
    if (d.includes('A') || d.includes('a')) desc = 'Cung tròn/Góc';
    else desc = 'Đường vẽ/Nét cong';
  } else if (tag === 'line') {
    desc = 'Nét thẳng';
  } else if (tag === 'rect') {
    desc = 'Hình chữ nhật/Khối';
  } else if (tag === 'circle' || tag === 'ellipse') {
    desc = 'Hình tròn/Oval';
  } else {
    desc = tag;
  }
  return `${desc} (${tag.toUpperCase()} #${index + 1})`;
}

export function getAllSelectableElements(svg: SVGSVGElement): { element: SVGElement; label: string }[] {
  const nodes = Array.from(svg.querySelectorAll('path, line, circle, ellipse, rect, text, polygon, polyline')) as SVGElement[];
  const filtered = nodes.filter(el => {
    // Ignore full size background rects
    if (el.tagName.toLowerCase() === 'rect') {
      const w = el.getAttribute('width');
      if (w === '100%' || parseFloat(w || '0') >= 700) return false;
    }
    return true;
  });

  return filtered.map((el, i) => ({
    element: el,
    label: getElementLabel(el, i)
  }));
}

export function findClosestElement(svg: SVGSVGElement, clientX: number, clientY: number, maxDistance: number = 60): SVGElement | null {
  const nodes = Array.from(svg.querySelectorAll('path, line, circle, ellipse, text, tspan, polygon, polyline, rect')) as SVGElement[];
  
  let closest: SVGElement | null = null;
  let minDist = maxDistance;

  for (const el of nodes) {
    if (el.tagName.toLowerCase() === 'rect') {
      const w = el.getAttribute('width');
      if (w === '100%' || parseFloat(w || '0') >= 700) continue;
    }

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    const dx = Math.max(rect.left - clientX, 0, clientX - rect.right);
    const dy = Math.max(rect.top - clientY, 0, clientY - rect.bottom);
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < minDist) {
      minDist = dist;
      closest = el;
    }
  }

  return closest;
}
