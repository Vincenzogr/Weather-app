/**
 * Scala a fasce colorate con un indicatore: usata per qualità dell'aria e UV.
 * Il colore non è mai l'unica informazione: il livello è sempre scritto accanto.
 */
export default function LevelScale({ levels, index, fraction, label }) {
  const position = ((index + Math.min(1, Math.max(0, fraction))) / levels.length) * 100;
  return (
    <div className="level-scale" role="img" aria-label={label}>
      <div className="level-scale__bands">
        {levels.map((level) => (
          <span key={level.key} style={{ background: level.color }} />
        ))}
      </div>
      <span className="level-scale__marker" style={{ left: `${position}%` }} />
    </div>
  );
}
