// Kartu surface standar: dark, border tipis, radius konsisten, bayangan halus.
// Dipakai sebagai pembungkus konten kartu lintas layar.
// props:
//   variant ('default'|'elevated'|'accent') -> gaya kartu
//   className (string)                      -> tambahan class
//   children (ReactNode)
export default function SurfaceCard({ variant = 'default', className = '', children, ...rest }) {
  return (
    <article className={`surface-card surface-${variant} ${className}`.trim()} {...rest}>
      {children}
    </article>
  )
}
