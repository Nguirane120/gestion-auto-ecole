"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import { getEleves, addPaiement, type Eleve } from "@/lib/firestore";

export default function NouveauPaiementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedEleve = searchParams.get("eleve") ?? "";

  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    eleve_id: preselectedEleve,
    montant: "",
    mode: "especes" as "especes" | "virement" | "cheque",
    note: "",
  });

  useEffect(() => {
    getEleves().then(setEleves);
  }, []);

  const eleveSelectionne = eleves.find((e) => e.id === form.eleve_id);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.eleve_id) {
      setError("Veuillez sélectionner un élève.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const eleve = eleves.find((el) => el.id === form.eleve_id);
      await addPaiement({
        eleve_id: form.eleve_id,
        eleve_nom: eleve?.nom ?? "",
        eleve_prenom: eleve?.prenom ?? "",
        montant: Number(form.montant),
        date: Timestamp.now(),
        mode: form.mode,
        note: form.note.trim() || undefined,
      });
      router.push(form.eleve_id ? `/eleves/${form.eleve_id}` : "/paiements");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">
          ← Retour
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Nouveau paiement</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Élève</label>
          <select
            name="eleve_id"
            required
            value={form.eleve_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— Choisir un élève —</option>
            {eleves.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nom} {e.prenom}
              </option>
            ))}
          </select>
          {eleveSelectionne && (
            <p className="text-xs text-gray-500 mt-1">
              Reste à payer :{" "}
              <span className="font-semibold text-red-600">
                {(eleveSelectionne.prix_total - eleveSelectionne.montant_paye).toLocaleString("fr-FR")} FCFA
              </span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Montant (FCFA)
          </label>
          <input
            name="montant"
            type="number"
            min="1"
            required
            value={form.montant}
            onChange={handleChange}
            placeholder="50000"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mode de paiement</label>
          <select
            name="mode"
            value={form.mode}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="especes">Espèces</option>
            <option value="virement">Virement</option>
            <option value="cheque">Chèque</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note (optionnel)
          </label>
          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Ex : 1er versement"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : "Enregistrer le paiement"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium px-5 py-2.5 rounded-lg text-sm transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
