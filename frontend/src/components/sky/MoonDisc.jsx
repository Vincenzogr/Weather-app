/**
 * Disco lunare con la fase reale: parte illuminata e terminatore ellittico.
 * Nell'emisfero sud la luna appare specchiata, quindi il disegno si ribalta.
 */
export default function MoonDisc({ phase, size = 22, southern = false, className }) {
  const r = 10;
  const k = Math.cos(2 * Math.PI * phase);
  const litRight = phase < 0.5;
  const outerSweep = litRight ? 1 : 0;
  const innerSweep = (k > 0) === litRight ? 0 : 1;
  const lit = `M 0 ${-r} A ${r} ${r} 0 0 ${outerSweep} 0 ${r} A ${(r * Math.abs(k)).toFixed(3)} ${r} 0 0 ${innerSweep} 0 ${-r} Z`;

  return (
    <svg className={className} width={size} height={size} viewBox="-11 -11 22 22" aria-hidden="true">
      <g transform={southern ? 'scale(-1 1)' : undefined}>
        <circle r={r} className="moon-disc__shadow" />
        <path d={lit} className="moon-disc__lit" />
      </g>
    </svg>
  );
}
