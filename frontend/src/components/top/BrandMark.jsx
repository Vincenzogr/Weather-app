/** Marchio: il sole a metà sull'orizzonte. */
export default function BrandMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="brand__mark">
      <path d="M6 21a10 10 0 0 1 20 0Z" className="brand__sun" />
      <path d="M3 21h26" className="brand__line" />
      <path d="M8 25.5h16" className="brand__line brand__line--soft" />
    </svg>
  );
}
