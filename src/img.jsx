/* Responsive image helper: every photo exists at 960 and 1920 wide, and the hero/full-bleed ones at 3840. */
const UHD = new Set(['bride', 'karahi', 'buffet', 'thali-dark', 'cake', 'rings', 'aisle', 'longtable', 'spread']);

export const imgSrc = (n, w = 1920) => `/img/${n}-${w}.webp`;

export function Img({ n, alt = '', sizes = '(max-width: 900px) 100vw, 50vw', className, eager = false, style }) {
  const widths = UHD.has(n) ? [960, 1920, 3840] : [960, 1920];
  return (
    <img
      className={className}
      style={style}
      src={imgSrc(n, 1920)}
      srcSet={widths.map((w) => `${imgSrc(n, w)} ${w}w`).join(', ')}
      sizes={sizes}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}
