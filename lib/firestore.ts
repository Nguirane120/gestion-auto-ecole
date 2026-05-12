import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type Formule = "Permis B" | "Permis A" | "Permis C" | "Permis D";

export interface Eleve {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  formule: Formule;
  prix_total: number;
  montant_paye: number;
  statut: "actif" | "suspendu" | "diplome";
  date_inscription: Timestamp;
}

export interface Paiement {
  id: string;
  eleve_id: string;
  eleve_nom?: string;
  eleve_prenom?: string;
  montant: number;
  date: Timestamp;
  mode: "especes" | "virement" | "cheque";
  note?: string;
}

export function resteAPayer(eleve: Pick<Eleve, "prix_total" | "montant_paye">) {
  return Math.max(0, eleve.prix_total - eleve.montant_paye);
}

export function bloqueExamen(eleve: Pick<Eleve, "prix_total" | "montant_paye">) {
  return resteAPayer(eleve) > 0;
}

// --- Élèves ---

export async function getEleves(): Promise<Eleve[]> {
  const snap = await getDocs(query(collection(db, "eleves"), orderBy("nom")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Eleve));
}

export async function getEleve(id: string): Promise<Eleve | null> {
  const snap = await getDoc(doc(db, "eleves", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Eleve;
}

export async function addEleve(
  data: Omit<Eleve, "id" | "date_inscription">
): Promise<string> {
  const ref = await addDoc(collection(db, "eleves"), {
    ...data,
    date_inscription: Timestamp.now(),
  });
  return ref.id;
}

export async function updateEleve(
  id: string,
  data: Partial<Omit<Eleve, "id">>
): Promise<void> {
  await updateDoc(doc(db, "eleves", id), data);
}

export async function deleteEleve(id: string): Promise<void> {
  await deleteDoc(doc(db, "eleves", id));
}

// --- Paiements ---

export async function getPaiements(): Promise<Paiement[]> {
  const snap = await getDocs(
    query(collection(db, "paiements"), orderBy("date", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Paiement));
}

export async function getPaiementsEleve(eleveId: string): Promise<Paiement[]> {
  const snap = await getDocs(
    query(
      collection(db, "paiements"),
      where("eleve_id", "==", eleveId),
      orderBy("date", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Paiement));
}

export async function addPaiement(
  data: Omit<Paiement, "id">
): Promise<string> {
  const ref = await addDoc(collection(db, "paiements"), data);

  const eleve = await getEleve(data.eleve_id);
  if (eleve) {
    const nouveau_montant = eleve.montant_paye + data.montant;
    await updateEleve(data.eleve_id, { montant_paye: nouveau_montant });
  }

  return ref.id;
}

export async function deletePaiement(
  id: string,
  eleveId: string,
  montant: number
): Promise<void> {
  await deleteDoc(doc(db, "paiements", id));
  const eleve = await getEleve(eleveId);
  if (eleve) {
    const nouveau_montant = Math.max(0, eleve.montant_paye - montant);
    await updateEleve(eleveId, { montant_paye: nouveau_montant });
  }
}
