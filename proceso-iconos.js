/* Iconos didácticos de procesos: dibujos vectoriales locales, sin fuentes ni red. */
(function () {
  'use strict';

  const drawings = Object.freeze({
    'actin-growth': `
      <path d="m4.5 16 4-3 4 3 4-3"/>
      <g fill="currentColor" fill-opacity=".16">
        <circle cx="4.5" cy="16" r="2.35"/><circle cx="8.5" cy="13" r="2.35"/>
        <circle cx="12.5" cy="16" r="2.35"/><circle cx="16.5" cy="13" r="2.35"/>
        <circle cx="24" cy="16" r="2.35"/>
      </g>
      <path d="m22.5 20.5-3.5-3.5m0 0h3m-3 0v3M22 3.5v6m-3-3h6"/>`,

    'actin-shrink': `
      <path d="m4.5 16 4-3 4 3"/>
      <g fill="currentColor" fill-opacity=".16">
        <circle cx="4.5" cy="16" r="2.35"/><circle cx="8.5" cy="13" r="2.35"/>
        <circle cx="12.5" cy="16" r="2.35"/><circle cx="24" cy="19" r="2.35"/>
      </g>
      <path d="m16.5 15.5 5 1.5m0 0-1.5-3m1.5 3-3 .8M18.5 6h7"/>`,

    treadmilling: `
      <path d="M5 14h18"/>
      <g fill="currentColor" fill-opacity=".16">
        <circle cx="6" cy="14" r="2.2"/><circle cx="11" cy="14" r="2.2"/>
        <circle cx="16" cy="14" r="2.2"/><circle cx="21" cy="14" r="2.2"/>
        <circle cx="24" cy="5" r="1.65"/><circle cx="3" cy="23" r="1.65"/>
      </g>
      <path d="M20 5h-7m0 0 2.5-2.5M13 5l2.5 2.5M15 23H8m0 0 2.5-2.5M8 23l2.5 2.5"/>`,

    motility: `
      <path fill="currentColor" fill-opacity=".08" d="M3 16c0-4 2.5-7.5 7-7.5 3.5 0 4.2 2 7.5 1.5l5.5-1-1 4 3 3-4 1.5-1 4-5-1c-2.5 2-6.5 2-9-.5C3.8 19.6 3 18.1 3 16Z"/>
      <ellipse cx="10" cy="15.5" rx="3.3" ry="2.7"/>
      <path d="m15 14 5-2m-5 4 6-.3m-6 2 4 2M16 4h9m-3-3 3 3-3 3"/>`,

    contraction: `
      <path d="M3 7h22M3 21h22M6 5v4m4-4v4m8-4v4m4-4v4M6 19v4m4-4v4m8-4v4m4-4v4"/>
      <path fill="currentColor" fill-opacity=".16" d="M11 11h6v6h-6z"/>
      <path d="m11 11-2-4m8 4 2-4m-8 10-2 4m8-4 2 4M2 14h6m-2-2 2 2-2 2m20-2h-6m2-2-2 2 2 2"/>`,

    critical: `
      <path d="M4 3.5v21h21M5 22l16-16"/>
      <path stroke-dasharray="2 2.5" d="M5 13h20"/>
      <g fill="currentColor" fill-opacity=".22">
        <circle cx="9" cy="19" r="1.7"/><circle cx="14" cy="16" r="1.7"/>
        <circle cx="17" cy="10" r="1.7"/><circle cx="22" cy="6" r="1.7"/>
      </g>
      <path d="m20 23 2-2 2 2M7.5 7h4m-2-2v4"/>`,

    'micro-growth': `
      <path fill="currentColor" fill-opacity=".1" d="M3.5 12.5c0-2.8 9-2.8 9 0v11c0 2.8-9 2.8-9 0Z"/>
      <ellipse cx="8" cy="12.5" rx="4.5" ry="2"/>
      <path d="M6.5 15v10m3-10v10M4 18h8M4 21.5h8"/>
      <g fill="currentColor" fill-opacity=".2"><circle cx="18" cy="6" r="2.1"/><circle cx="21" cy="9" r="2.1"/></g>
      <path d="m17 12-3 3m0 0v-3m0 3h3M23 17v6m-3-3h6"/>`,

    'micro-shrink': `
      <path fill="currentColor" fill-opacity=".1" d="M3.5 16c0-2.8 9-2.8 9 0v7.5c0 2.8-9 2.8-9 0Z"/>
      <ellipse cx="8" cy="16" rx="4.5" ry="2"/>
      <path d="M6.5 18.5V25m3-6.5V25M4 21.5h8"/>
      <g fill="currentColor" fill-opacity=".2"><circle cx="18" cy="6" r="2.1"/><circle cx="21" cy="9" r="2.1"/></g>
      <path d="m13 13 3-3m0 0v3m0-3h-3M19 20h7"/>`,

    catastrophe: `
      <path fill="currentColor" fill-opacity=".1" d="M9 15h10v9c-3 2-7 2-10 0Z"/>
      <path d="M9 24V14c0-3-1.5-5-4-5-2 0-3 1.7-2 3.2M12 24V10c0-2-1-4-3-5m7 19V10c0-2 1-4 3-5m0 19V14c0-3 1.5-5 4-5 2 0 3 1.7 2 3.2M9 18h10m-10 3h10"/>
      <path d="m13 3-1 4h3l-1 4"/>`,

    rescue: `
      <path fill="currentColor" fill-opacity=".1" d="M4 13h9v11c-3 2-6 2-9 0Z"/>
      <path d="M4 24V13m3 12V13m3 12V13m3 11V13M4 17h9M4 21h9"/>
      <ellipse fill="currentColor" fill-opacity=".25" cx="8.5" cy="12.5" rx="4.5" ry="2"/>
      <path d="M18 22c7-1 8-11 2-15m0 0h4m-4 0v4M8.5 4v4m-2-2h4"/>`,

    transport: `
      <path d="M2 22h24M2 25h24m-20-3v3m5-3v3m5-3v3m5-3v3"/>
      <circle fill="currentColor" fill-opacity=".16" cx="11" cy="9" r="5"/>
      <path d="M11 14v3m0 0-4 4m4-4 4 4M19 7h7m-3-3 3 3-3 3"/>
      <path stroke-width="2.2" d="M6 21h2m6 0h2"/>`,

    intermediate: `
      <path d="M3 5c6 0 5 18 11 18S19 5 25 5M3 11c6 0 5 12 11 12S19 11 25 11M3 17c6 0 5-12 11-12s5 12 11 12M3 23c6 0 5-18 11-18s5 18 11 18"/>
      <path opacity=".45" d="M3 14h3m16 0h3"/>`
  });

  window.CelmaProcessIcon = function (id) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 28 28');
    svg.setAttribute('width', '26');
    svg.setAttribute('height', '26');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.6');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.innerHTML = drawings[id] || '<circle cx="14" cy="14" r="8"/><path d="m11 9 7 5-7 5Z"/>';
    return svg;
  };
}());
