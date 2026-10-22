// "use client";
// import Link from "next/link";
// import { usePathname } from "next/navigation";

// const links = [
//   { href: "/", label: "Overview" },
//   { href: "/incidents", label: "Incidents" },
// ];

// export default function NavLinks() {
//   const path = usePathname();
//   return (
//     <nav className="flex flex-col gap-1 text-sm">
//       {links.map((l) => {
//         const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
//         return (
//           <Link
//             key={l.href}
//             href={l.href}
//             aria-current={active ? "page" : undefined}
//             className="rounded px-3 py-2 hover:bg-[var(--panel-raised)]"
//             style={{
//               color: active ? "var(--accent)" : "var(--text)",
//               background: active ? "var(--panel-raised)" : undefined,
//             }}
//           >
//             {l.label}
//           </Link>
//         );
//       })}
//     </nav>
//   );
// }

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// const links = [
//   { href: "/", label: "Overview" },
//   { href: "/incidents", label: "Incidents" },
//   { href: "/approvals", label: "Approvals" },
// ];

// const links = [
//   { href: "/", label: "Overview" },
//   { href: "/incidents", label: "Incidents" },
//   { href: "/graph", label: "Attack graph" },
//   { href: "/approvals", label: "Approvals" },
// ];

const links = [
  { href: "/", label: "Overview" },
  { href: "/incidents", label: "Incidents" },
  { href: "/graph", label: "Attack graph" },
  { href: "/analyst", label: "AI analyst" },
  { href: "/approvals", label: "Approvals" },
];

export default function NavLinks() {
  const path = usePathname();
  return (
    <nav className="flex flex-col gap-1 text-sm">
      {links.map((l) => {
        const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className="rounded px-3 py-2 hover:bg-[var(--panel-raised)]"
            style={{
              color: active ? "var(--accent)" : "var(--text)",
              background: active ? "var(--panel-raised)" : undefined,
            }}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}