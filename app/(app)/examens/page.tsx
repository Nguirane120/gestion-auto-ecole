"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faBan,
  faCircleCheck,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { getEleves, bloqueExamen, resteAPayer, type Eleve } from "@/lib/firestore";

function formatXOF(n: number) {
  return n.toLocaleString("fr-FR") + " FCFA";
}

export default function ExamensPage() {
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState<"tous" | "bloques" | "autorises">("tous");

  useEffect(() => {
    getEleves()
      .then(setEleves)
      .finally(() => setLoading(false));
  }, []);

  const filtered = eleves.filter((e) => {
    if (filtre === "bloques") return bloqueExamen(e);
    if (filtre === "autorises") return !bloqueExamen(e);
    return true;
  });

  const nbBloques = eleves.filter(bloqueExamen).length;
  const nbAutorises = eleves.length - nbBloques;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Examens</h1>
      <p className="text-sm text-gray-500 mb-6">
        Statut d'accès aux examens selon les paiements
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-gray-300">
          <p className="text-xs text-gray-500">Total élèves</p>
          <p className="text-2xl font-bold text-gray-800">{eleves.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-green-500">
          <p className="text-xs text-gray-500">Autorisés</p>
          <p className="text-2xl font-bold text-green-700">{nbAutorises}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-red-500">
          <p className="text-xs text-gray-500">Bloqués</p>
          <p className="text-2xl font-bold text-red-700">{nbBloques}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
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

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <FontAwesomeIcon icon={faClipboardList} className="text-5xl w-12 mb-3 text-gray-300" />
            <p className="text-sm">Aucun élève dans cette catégorie.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500">
                <th className="px-5 py-3 font-medium">Élève</th>
                <th className="px-5 py-3 font-medium">Formule</th>
                <th className="px-5 py-3 font-medium">Montant payé</th>
                <th className="px-5 py-3 font-medium">Reste à payer</th>
                <th className="px-5 py-3 font-medium">Statut examen</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const reste = resteAPayer(e);
                const bloque = bloqueExamen(e);
                return (
                  <tr
                    key={e.id}
                    className={`border-b last:border-0 ${bloque ? "bg-red-50" : ""}`}
                  >
                    <td className="px-5 py-3 font-semibold">
                      {e.nom} {e.prenom}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{e.formule}</td>
                    <td className="px-5 py-3 text-green-700">
                      {formatXOF(e.montant_paye)}
                    </td>
                    <td className="px-5 py-3">
                      {reste > 0 ? (
                        <span className="font-semibold text-red-600">{formatXOF(reste)}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {bloque ? (
                        <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
                          <FontAwesomeIcon icon={faBan} className="w-3" /> BLOQUÉ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                          <FontAwesomeIcon icon={faCircleCheck} className="w-3" /> AUTORISÉ
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {bloque && (
                        <Link
                          href={`/paiements/nouveau?eleve=${e.id}`}
                          className="inline-flex items-center gap-1 text-xs text-green-600 font-medium hover:underline"
                        >
                          Régulariser <FontAwesomeIcon icon={faArrowRight} className="w-3" />
                        </Link>
                      )}
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
