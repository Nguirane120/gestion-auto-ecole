"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faBan,
  faCircleCheck,
  faPenToSquare,
  faPlus,
  faTrash,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import {
  getEleve,
  getPaiementsEleve,
  deleteEleve,
  deletePaiement,
  bloqueExamen,
  resteAPayer,
  type Eleve,
  type Paiement,
} from "@/lib/firestore";

function formatXOF(n: number) {
  return n.toLocaleString("fr-FR") + " FCFA";
}

function formatDate(ts: { seconds: number }) {
  return new Date(ts.seconds * 1000).toLocaleDateString("fr-FR");
}

export default function EleveDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [eleve, setEleve] = useState<Eleve | null>(null);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);

  async function charger() {
    const [e, p] = await Promise.all([getEleve(id), getPaiementsEleve(id)]);
    setEleve(e);
    setPaiements(p);
    setLoading(false);
  }

  useEffect(() => {
    charger();
  }, [id]);

  async function handleDeleteEleve() {
    if (!eleve) return;
    if (!confirm(`Supprimer définitivement ${eleve.nom} ${eleve.prenom} ?`)) return;
    await deleteEleve(id);
    router.push("/eleves");
  }

  async function handleDeletePaiement(pId: string, montant: number) {
    if (!confirm("Supprimer ce paiement ?")) return;
    await deletePaiement(pId, id, montant);
    await charger();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!eleve) {
    return (
      <div className="text-center py-20 text-gray-400">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="text-5xl w-12 mb-3 text-gray-300" />
        <p>Élève introuvable.</p>
        <Link href="/eleves" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const reste = resteAPayer(eleve);
  const bloque = bloqueExamen(eleve);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/eleves"
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-3" /> Retour
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">
          {eleve.nom} {eleve.prenom}
        </h1>
        {bloque ? (
          <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
            <FontAwesomeIcon icon={faBan} className="w-3" /> Bloqué examen
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
            <FontAwesomeIcon icon={faCircleCheck} className="w-3" /> Autorisé examen
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-blue-400">
          <p className="text-xs text-gray-500">Prix total</p>
          <p className="text-xl font-bold text-gray-800">{formatXOF(eleve.prix_total)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-green-400">
          <p className="text-xs text-gray-500">Montant payé</p>
          <p className="text-xl font-bold text-green-700">{formatXOF(eleve.montant_paye)}</p>
        </div>
        <div className={`bg-white rounded-2xl shadow-sm p-5 border-l-4 ${reste > 0 ? "border-red-400" : "border-emerald-400"}`}>
          <p className="text-xs text-gray-500">Reste à payer</p>
          <p className={`text-xl font-bold ${reste > 0 ? "text-red-600" : "text-emerald-600"}`}>
            {reste > 0 ? formatXOF(reste) : "Soldé"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
          Informations
        </h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">Téléphone</dt>
            <dd className="font-medium">{eleve.telephone}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Formule</dt>
            <dd className="font-medium">{eleve.formule}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Statut</dt>
            <dd className="font-medium capitalize">{eleve.statut}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Date d'inscription</dt>
            <dd className="font-medium">
              {eleve.date_inscription ? formatDate(eleve.date_inscription) : "—"}
            </dd>
          </div>
        </dl>
        <div className="flex gap-3 mt-5">
          <Link
            href={`/eleves/${id}/modifier`}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-3.5" /> Modifier
          </Link>
          <Link
            href={`/paiements/nouveau?eleve=${id}`}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            <FontAwesomeIcon icon={faPlus} className="w-3.5" /> Ajouter paiement
          </Link>
          <button
            onClick={handleDeleteEleve}
            className="inline-flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium px-4 py-2 rounded-lg transition ml-auto"
          >
            <FontAwesomeIcon icon={faTrash} className="w-3.5" /> Supprimer l'élève
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
          Historique des paiements
        </h2>
        {paiements.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun paiement enregistré.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b text-gray-500">
              <tr>
                <th className="pb-2 text-left font-medium">Date</th>
                <th className="pb-2 text-left font-medium">Montant</th>
                <th className="pb-2 text-left font-medium">Mode</th>
                <th className="pb-2 text-left font-medium">Note</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {paiements.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-3">{p.date ? formatDate(p.date) : "—"}</td>
                  <td className="py-3 font-semibold text-green-700">
                    {formatXOF(p.montant)}
                  </td>
                  <td className="py-3 capitalize text-gray-600">{p.mode}</td>
                  <td className="py-3 text-gray-500">{p.note || "—"}</td>
                  <td className="py-3">
                    <button
                      onClick={() => handleDeletePaiement(p.id, p.montant)}
                      className="text-gray-400 hover:text-red-600 transition"
                      title="Supprimer ce paiement"
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
