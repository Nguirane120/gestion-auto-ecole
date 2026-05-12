"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addEleve, type Formule } from "@/lib/firestore";

const formules: Formule[] = ["Permis B", "Permis A", "Permis C", "Permis D"];

export default function NouvelElevePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    formule: "Permis B" as Formule,
    prix_total: "",
    montant_paye: "0",
    statut: "actif" as const,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await addEleve({
        nom: form.nom.trim().toUpperCase(),
        prenom: form.prenom.trim(),
        telephone: form.telephone.trim(),
        formule: form.formule,
        prix_total: Number(form.prix_total),
        montant_paye: Number(form.montant_paye),
        statut: form.statut,
      });
      router.push("/eleves");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ← Retour
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Nouvel élève</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm p-6 space-y-5"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              name="nom"
              required
              value={form.nom}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input
              name="prenom"
              required
              value={form.prenom}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
          <input
            name="telephone"
            required
            value={form.telephone}
            onChange={handleChange}
            placeholder="77XXXXXXX"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Formule</label>
          <select
            name="formule"
            value={form.formule}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {formules.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix total (FCFA)
            </label>
            <input
              name="prix_total"
              type="number"
              min="0"
              required
              value={form.prix_total}
              onChange={handleChange}
              placeholder="300000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant payé (FCFA)
            </label>
            <input
              name="montant_paye"
              type="number"
              min="0"
              value={form.montant_paye}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select
            name="statut"
            value={form.statut}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="actif">Actif</option>
            <option value="suspendu">Suspendu</option>
            <option value="diplome">Diplômé</option>
          </select>
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
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
