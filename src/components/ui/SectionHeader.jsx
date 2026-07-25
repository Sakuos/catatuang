// Judul seksi dengan eyebrow + aksi opsional (mis. "Lihat semua").
// props:
//   eyebrow (string)  -> label kecil di atas judul
//   title (string)    -> judul seksi
//   action (ReactNode)-> slot tombol aksi kanan
export default function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h3>{title}</h3>
      </div>
      {action}
    </div>
  )
}
