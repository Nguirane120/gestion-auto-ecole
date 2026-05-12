"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGaugeHigh,
  faUserGraduate,
  faMoneyBillWave,
  faClipboardList,
  faRightFromBracket,
  faCar,
} from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { auth } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";

const navItems: { href: string; label: string; icon: IconDefinition }[] = [
  { href: "/", label: "Tableau de bord", icon: faGaugeHigh },
  { href: "/eleves", label: "Élèves", icon: faUserGraduate },
  { href: "/paiements", label: "Paiements", icon: faMoneyBillWave },
  { href: "/examens", label: "Examens", icon: faClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="px-6 py-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faCar} className="text-blue-400 text-2xl w-7" />
          <div>
            <p className="font-bold text-lg leading-tight">Auto-École</p>
            <p className="text-gray-400 text-xs">Gestion</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-700">
        <p className="text-gray-400 text-xs mb-3 truncate">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-gray-800 transition"
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
