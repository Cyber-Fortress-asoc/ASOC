// import "./globals.css";
// import Link from "next/link";

// export const metadata = { title: "Sentinel — Autonomous SOC Analyst" };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body className="flex min-h-screen">
//         <aside className="flex w-60 shrink-0 flex-col border-r px-5 py-6" style={{ borderColor: "var(--border)" }}>
//           <div className="mb-10 flex items-center gap-3">
//             <span className="sweep-ring relative flex h-8 w-8 items-center justify-center rounded-full border" style={{ borderColor: "var(--border)" }}>
//               <span className="h-2 w-2 rounded-full" style={{ background: "var(--accent)" }} />
//             </span>
//             <div>
//               <p className="text-sm font-semibold">Sentinel</p>
//               <p className="mono text-[11px]" style={{ color: "var(--muted)" }}>SOC Analyst</p>
//             </div>
//           </div>
//           <nav className="flex flex-col gap-1 text-sm">
//             <Link href="/" className="rounded px-3 py-2 hover:bg-[var(--panel-raised)]" style={{ color: "var(--text)" }}>Overview</Link>
//             <Link href="/incidents" className="rounded px-3 py-2 hover:bg-[var(--panel-raised)]" style={{ color: "var(--text)" }}>Incidents</Link>
//           </nav>
//           <div className="mt-auto flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
//             <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
//             Pipeline live
//           </div>
//         </aside>
//         <main className="flex-1 overflow-x-auto p-8">{children}</main>
//       </body>
//     </html>
//   );
// }


import "./globals.css";
import NavLinks from "@/components/NavLinks";

export const metadata = { title: "Sentinel — Autonomous SOC Analyst" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen">
        <aside className="flex w-60 shrink-0 flex-col border-r px-5 py-6" style={{ borderColor: "var(--border)" }}>
          <div className="mb-10 flex items-center gap-3">
            <span className="sweep-ring relative flex h-8 w-8 items-center justify-center rounded-full border" style={{ borderColor: "var(--border)" }}>
              <span className="h-2 w-2 rounded-full" style={{ background: "var(--accent)" }} />
            </span>
            <div>
              <p className="text-sm font-semibold">Sentinel</p>
              <p className="mono text-[11px]" style={{ color: "var(--muted)" }}>SOC Analyst</p>
            </div>
          </div>
          <NavLinks />
          <div className="mt-auto flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
            Pipeline live
          </div>
        </aside>
        <main className="flex-1 overflow-x-auto p-8">{children}</main>
      </body>
    </html>
  );
}