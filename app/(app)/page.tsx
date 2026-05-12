"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGraduate,
  faMoneyBill,
  faCircleCheck,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { getEleves, bloqueExamen, type Eleve } from "@/lib/firestore";

interface Stats {
  totalEleves: number;
  montantAttendu: number;
  montantPercu: number;
  nbBloques: number;
}

function StatCard({
  label,
  value,
  icon,
  iconColor,
  color,
}: {
  label: string;
  value: string | number;
  icon: IconDefinition;
  iconColor: string;
  color: string;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <FontAwesomeIcon icon={icon} className={`text-3xl w-8 ${iconColor}`} />
      </div>
    </div>
  );
}

function formatXOF(n: number) {
  return n.toLocaleString("fr-FR") + " FCFA";
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEleves()
      .then((data) => {
        setEleves(data);
        setStats({
          totalEleves: data.length,
          montantAttendu: data.reduce((s, e) => s + e.prix_total, 0),
          montantPercu: data.reduce((s, e) => s + e.montant_paye, 0),
          nbBloques: data.filter(bloqueExamen).length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Total élèves"
          value={stats?.totalEleves ?? 0}
          icon={faUserGraduate}
          iconColor="text-blue-400"
          color="border-blue-500"
        />
        <StatCard
          label="Montant attendu"
          value={formatXOF(stats?.montantAttendu ?? 0)}
          icon={faMoneyBill}
          iconColor="text-green-400"
          color="border-green-500"
        />
        <StatCard
          label="Montant perçu"
          value={formatXOF(stats?.montantPercu ?? 0)}
          icon={faCircleCheck}
          iconColor="text-emerald-400"
          color="border-emerald-500"
        />
        <StatCard
          label="Bloqués à l'examen"
          value={stats?.nbBloques ?? 0}
          icon={faBan}
          iconColor="text-red-400"
          color="border-red-500"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Élèves récents</h2>
        {eleves.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun élève enregistré.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 font-medium">Nom & Prénom</th>
                <th className="pb-2 font-medium">Formule</th>
                <th className="pb-2 font-medium">Reste à payer</th>
                <th className="pb-2 font-medium">Examen</th>
              </tr>
            </thead>
            <tbody>
              {eleves.slice(0, 8).map((e) => {
                const reste = e.prix_total - e.montant_paye;
                const bloque = bloqueExamen(e);
                return (
                  <tr key={e.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-medium">
                      {e.nom} {e.prenom}
                    </td>
                    <td className="py-3 text-gray-600">{e.formule}</td>
                    <td className="py-3">
                      {reste > 0 ? (
                        <span className="text-red-600">{formatXOF(reste)}</span>
                      ) : (
                        <span className="text-green-600">Soldé</span>
                      )}
                    </td>
                    <td className="py-3">
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
