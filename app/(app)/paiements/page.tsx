"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons";
import { getPaiements, type Paiement } from "@/lib/firestore";

function formatXOF(n: number) {
  return n.toLocaleString("fr-FR") + " FCFA";
}

function formatDate(ts: { seconds: number }) {
  return new Date(ts.seconds * 1000).toLocaleDateString("fr-FR");
}

const modeLabels: Record<string, string> = {
  especes: "Espèces",
  virement: "Virement",
  cheque: "Chèque",
};

export default function PaiementsPage() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPaiements()
      .then(setPaiements)
      .finally(() => setLoading(false));
  }, []);

  const total = paiements.reduce((s, p) => s + p.montant, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Paiements</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Total perçu :{" "}
            <span className="font-semibold text-green-700">{formatXOF(total)}</span>
          </p>
        </div>
        <Link
          href="/paiements/nouveau"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3.5" />
          Nouveau paiement
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        ) : paiements.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <FontAwesomeIcon icon={faMoneyBillWave} className="text-5xl w-12 mb-3 text-gray-300" />
            <p className="text-sm">Aucun paiement enregistré.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Élève</th>
                <th className="px-5 py-3 font-medium">Montant</th>
                <th className="px-5 py-3 font-medium">Mode</th>
                <th className="px-5 py-3 font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              {paiements.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-600">
                    {p.date ? formatDate(p.date) : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/eleves/${p.eleve_id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {p.eleve_nom} {p.eleve_prenom}
                    </Link>
                  </td>
                  <td className="px-5 py-3 font-semibold text-green-700">
                    {formatXOF(p.montant)}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {modeLabels[p.mode] ?? p.mode}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{p.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
