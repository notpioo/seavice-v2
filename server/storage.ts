import { firestore } from "./firebase";
import type { Product, Service } from "@shared/schema";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getServices(): Promise<Service[]>;
  seedData(): Promise<void>;
}

export class FirestoreStorage implements IStorage {
  private productsCollection = firestore.collection("products");
  private servicesCollection = firestore.collection("services");

  async getProducts(): Promise<Product[]> {
    const snapshot = await this.productsCollection.get();
    return snapshot.docs.map((doc) => ({
      id: parseInt(doc.id) || 0,
      ...doc.data(),
    })) as Product[];
  }

  async getServices(): Promise<Service[]> {
    const snapshot = await this.servicesCollection.get();
    return snapshot.docs.map((doc) => ({
      id: parseInt(doc.id) || 0,
      ...doc.data(),
    })) as Service[];
  }

  async seedData(): Promise<void> {
    // Products seeding removed - no longer needed
    // Products will be managed via admin panel or Firestore directly

    // Seed services jika kosong (untuk menu PPOB)
    const servicesSnapshot = await this.servicesCollection.limit(1).get();
    if (servicesSnapshot.empty) {
      const services = [
        { name: "Pulsa", icon: "smartphone", slug: "pulsa" },
        { name: "Kuota", icon: "wifi", slug: "kuota" },
        { name: "PLN", icon: "zap", slug: "pln" },
        { name: "Game", icon: "gamepad-2", slug: "game" },
        { name: "E-Money", icon: "wallet", slug: "emoney" },
        { name: "Sosmed", icon: "heart", slug: "sosmed" },
        { name: "Streaming", icon: "tv", slug: "streaming" },
        { name: "Lainnya", icon: "grid", slug: "lainnya" },
      ];

      const batch = firestore.batch();
      services.forEach((service, index) => {
        const docRef = this.servicesCollection.doc(String(index + 1));
        batch.set(docRef, service);
      });
      await batch.commit();
      console.log("✅ Seeded services to Firestore");
    }
  }
}

export const storage = new FirestoreStorage();
