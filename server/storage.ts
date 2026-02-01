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
    // Seed products jika kosong
    const productsSnapshot = await this.productsCollection.limit(1).get();
    if (productsSnapshot.empty) {
      const products = [
        { name: "Wireless Earbuds", price: 250000, category: "Electronics", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80", rating: "4.8" },
        { name: "Smart Watch", price: 850000, category: "Electronics", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80", rating: "4.6" },
        { name: "Running Shoes", price: 450000, category: "Fashion", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80", rating: "4.7" },
        { name: "Backpack", price: 150000, category: "Fashion", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80", rating: "4.5" },
        { name: "Mechanical Keyboard", price: 1200000, category: "Electronics", image: "https://images.unsplash.com/photo-1587829741301-dc798b91a603?w=500&q=80", rating: "4.9" },
        { name: "Coffee Maker", price: 350000, category: "Home", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80", rating: "4.4" },
      ];

      const batch = firestore.batch();
      products.forEach((product, index) => {
        const docRef = this.productsCollection.doc(String(index + 1));
        batch.set(docRef, product);
      });
      await batch.commit();
      console.log("✅ Seeded products to Firestore");
    }

    // Seed services jika kosong
    const servicesSnapshot = await this.servicesCollection.limit(1).get();
    if (servicesSnapshot.empty) {
      const services = [
        { name: "Pulsa", icon: "smartphone", slug: "pulsa" },
        { name: "Kuota", icon: "wifi", slug: "kuota" },
        { name: "PLN", icon: "zap", slug: "pln" },
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
