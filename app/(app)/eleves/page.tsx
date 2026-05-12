"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faUserGraduate,
  faBan,
  faCircleCheck,
  faMagnifyingGlass,
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { getEleves, deleteEleve, bloqueExamen, type Eleve } from "@/lib/firestore";

function formatXOF(n: number) {
  return n.toLocaleString("fr-FR") + " FCFA";
}

export default function ElevesPage() {
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState<"tous" | "bloques" | "autorises">("tous");
  const [search, setSearch] = useState("");

  async function charger() {
    setLoading(true);
    const data = await getEleves();
    setEleves(data);
    setLoading(false);
  }

  useEffect(() => {
    charger();
  }, []);

  async function handleDelete(id: string, nom: string) {
    if (!confirm(`Supprimer l'élève ${nom} ?`)) return;
    await deleteEleve(id);
    setEleves((prev) => prev.filter((e) => e.id !== id));
  }

  const filtered = eleves.filter((e) => {
    const matchSearch =
      !search ||
      `${e.nom} ${e.prenom}`.toLowerCase().includes(search.toLowerCase()) ||
      e.telephone.includes(search);

    if (filtre === "bloques") return matchSearch && bloqueExamen(e);
    if (filtre === "autorises") return matchSearch && !bloqueExamen(e);
    return matchSearch;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Élèves</h1>
        <Link
          href="/eleves/nouveau"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3.5" />
          Nouvel élève
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5"
          />
          <input
            type="text"
            placeholder="Rechercher par nom ou téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {(["tous", "bloques", "autorises"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltre(f)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                filtre === f
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f === "bloques" && <FontAwesomeIcon icon={faBan} className="w-3" />}
              {f === "autorises" && <FontAwesomeIcon icon={faCircleCheck} className="w-3" />}
              {f === "tous" ? "Tous" : f === "bloques" ? "Bloqués" : "Autorisés"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <FontAwesomeIcon icon={faUserGraduate} className="text-5xl w-12 mb-3 text-gray-300" />
            <p className="text-sm">Aucun élève trouvé.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500">
                <th className="px-5 py-3 font-medium">Nom & Prénom</th>
                <th className="px-5 py-3 font-medium">Téléphone</th>
                <th className="px-5 py-3 font-medium">Formule</th>
                <th className="px-5 py-3 font-medium">Payé / Total</th>
                <th className="px-5 py-3 font-medium">Reste</th>
                <th className="px-5 py-3 font-medium">Examen</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const reste = e.prix_total - e.montant_paye;
                const bloque = bloqueExamen(e);
                return (
                  <tr key={e.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/eleves/${e.id}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {e.nom} {e.prenom}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{e.telephone}</td>
                    <td className="px-5 py-3 text-gray-600">{e.formule}</td>
                    <td className="px-5 py-3">
                      <span className="text-green-700">{formatXOF(e.montant_paye)}</span>
                      <span className="text-gray-400"> / </span>
                      {formatXOF(e.prix_total)}
                    </td>
                    <td className="px-5 py-3">
                      {reste > 0 ? (
                        <span className="text-red-600 font-medium">{formatXOF(reste)}</span>
                      ) : (
                        <span className="text-green-600 font-medium">Soldé</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {bloque ? (
                        <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          <FontAwesomeIcon icon={faBan} className="w-3" /> Bloqué
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          <FontAwesomeIcon icon={faCircleCheck} className="w-3" /> Autorisé
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/eleves/${e.id}/modifier`}
                          className="text-gray-400 hover:text-blue-600 transition"
                          title="Modifier"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} className="w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(e.id, `${e.nom} ${e.prenom}`)}
                          className="text-gray-400 hover:text-red-600 transition"
                          title="Supprimer"
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
