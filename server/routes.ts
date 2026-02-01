import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import admin from "firebase-admin";
import { firestore } from "./firebase";
import { uploadToCloudinary, uploadAvatarToCloudinary } from "./cloudinary";
import { createSnapTransaction } from "./midtrans";
import multer from "multer";
import type { User, UserRole, Transaction } from "@shared/schema";

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Extend Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
      };
    }
  }
}

// Auth middleware - verify Firebase token
async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
    };
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
}

// Get user profile from Firestore
async function getUserProfile(uid: string): Promise<User | null> {
  const doc = await firestore.collection("users").doc(uid).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data() as User;
}

// Create user profile in Firestore
async function createUserProfile(
  uid: string,
  email: string,
  displayName?: string | null,
  photoURL?: string | null,
  role: UserRole = "user"
): Promise<User> {
  const now = new Date().toISOString();
  const userData: User = {
    uid,
    email,
    displayName: displayName || null,
    photoURL: photoURL || null,
    role,
    points: 0, // Default points
    createdAt: now,
    updatedAt: now,
  };

  await firestore.collection("users").doc(uid).set(userData);
  return userData;
}

// Update user profile in Firestore
async function updateUserProfile(
  uid: string,
  updates: Partial<Pick<User, "displayName" | "photoURL" | "role" | "phone" | "address" | "bannerUrl" | "points">>
): Promise<User | null> {
  const now = new Date().toISOString();

  // Remove undefined fields
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, v]) => v !== undefined)
  );

  await firestore.collection("users").doc(uid).update({
    ...cleanUpdates,
    updatedAt: now,
  });
  return getUserProfile(uid);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ============ Health Check ============
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });

  // Initialize seed data
  await storage.seedData();

  // ============ Products & Services Routes ============
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.services.list.path, async (req, res) => {
    const services = await storage.getServices();
    res.json(services);
  });

  // ============ Auth Routes ============

  // Get user profile
  app.get("/api/auth/profile", authMiddleware, async (req, res) => {
    try {
      const user = await getUserProfile(req.user!.uid);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ user });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create user profile
  app.post("/api/auth/profile", authMiddleware, async (req, res) => {
    try {
      const { displayName, photoURL } = req.body;

      // Check if user already exists
      const existingUser = await getUserProfile(req.user!.uid);
      if (existingUser) {
        return res.json({ user: existingUser });
      }

      // Create new user
      const user = await createUserProfile(
        req.user!.uid,
        req.user!.email,
        displayName,
        photoURL
      );

      console.log(`✅ Created new user profile: ${user.email}`);
      res.status(201).json({ user });
    } catch (error) {
      console.error("Create profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update user profile
  app.patch("/api/auth/profile", authMiddleware, async (req, res) => {
    try {
      const { displayName, photoURL, phone, address } = req.body;

      const user = await updateUserProfile(req.user!.uid, {
        displayName,
        photoURL,
        phone,
        address,
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ user });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin: Update user role (only admins can do this)
  app.patch("/api/admin/users/:uid/role", authMiddleware, async (req, res) => {
    try {
      // Check if requester is admin
      const requester = await getUserProfile(req.user!.uid);
      if (!requester || requester.role !== "admin") {
        return res.status(403).json({ error: "Forbidden - Admin access required" });
      }

      const { uid } = req.params;
      const { role } = req.body as { role: string };

      if (!role || !["user", "admin"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      const user = await updateUserProfile(uid, { role: role as UserRole });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      console.log(`✅ Updated user ${uid} role to ${role}`);
      res.json({ user });
    } catch (error) {
      console.error("Update role error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // TEMP: Setup admin (Hapus nanti)
  app.get("/api/temp-setup-admin", async (req, res) => {
    try {
      // Hardcoded email for safety
      const targetEmail = "admin@gmail.com";

      const snapshot = await firestore.collection("users").where("email", "==", targetEmail).get();

      if (snapshot.empty) {
        return res.status(404).json({ error: "User not found" });
      }

      await snapshot.docs[0].ref.update({
        role: "admin",
        updatedAt: new Date().toISOString()
      });

      res.json({ message: `Success! ${targetEmail} is now an admin.` });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  // ============ Order & Payment Routes ============

  // Create order and get Midtrans Snap token
  app.post("/api/orders/create", authMiddleware, async (req, res) => {
    try {
      const { productId, productName, providerId, providerName, type, target, price, originalPrice, pointsUsed, voucherCode, voucherDiscount } = req.body;

      if (!productId || !productName || !target || !price) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const now = new Date().toISOString();
      const orderId = `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Get user info
      const userProfile = await getUserProfile(req.user!.uid);
      if (!userProfile) {
        return res.status(404).json({ error: "User not found" });
      }

      // If using points, deduct them now
      if (pointsUsed && pointsUsed > 0) {
        const currentPoints = userProfile.points || 0;
        if (currentPoints < pointsUsed) {
          return res.status(400).json({ error: "Insufficient points" });
        }

        await firestore.collection("users").doc(req.user!.uid).update({
          points: currentPoints - pointsUsed,
          updatedAt: now,
        });
      }

      // Create transaction record in Firestore
      const transactionData: Partial<Transaction> = {
        id: orderId,
        userId: req.user!.uid,
        productId,
        productName,
        providerId: providerId || "unknown",
        providerName: providerName || "Unknown Provider",
        type: type || "pulsa",
        target,
        price: originalPrice || price, // Store original price
        status: "pending",
        paymentStatus: "unpaid",
        createdAt: now,
        updatedAt: now,
      };

      // Create Midtrans Snap transaction
      const snapTransaction = await createSnapTransaction({
        orderId,
        grossAmount: price,
        customerDetails: {
          first_name: userProfile.displayName || "Customer",
          email: userProfile.email,
          phone: userProfile.phone || undefined,
        },
        itemDetails: [
          {
            id: productId,
            price: price,
            quantity: 1,
            name: productName,
          },
        ],
      });

      // Save snap token to transaction
      transactionData.midtransOrderId = orderId;
      transactionData.snapToken = snapTransaction.token;

      await firestore.collection("transactions").doc(orderId).set(transactionData);

      res.json({
        orderId,
        snapToken: snapTransaction.token,
        redirectUrl: snapTransaction.redirect_url,
      });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Create order with points only (no Midtrans needed)
  app.post("/api/orders/create-with-points", authMiddleware, async (req, res) => {
    try {
      const { productId, productName, providerId, providerName, type, target, price, pointsUsed, voucherCode, voucherDiscount } = req.body;

      if (!productId || !productName || !target || !price || !pointsUsed) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Get user info
      const userProfile = await getUserProfile(req.user!.uid);
      if (!userProfile) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user has enough points
      const currentPoints = userProfile.points || 0;
      if (currentPoints < pointsUsed) {
        return res.status(400).json({ error: "Insufficient points" });
      }

      const now = new Date().toISOString();
      const orderId = `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Deduct points from user
      const newPoints = currentPoints - pointsUsed;
      await firestore.collection("users").doc(req.user!.uid).update({
        points: newPoints,
        updatedAt: now,
      });

      // Create transaction record
      const transactionData: Partial<Transaction> = {
        id: orderId,
        userId: req.user!.uid,
        productId,
        productName,
        providerId: providerId || "unknown",
        providerName: providerName || "Unknown Provider",
        type: type || "pulsa",
        target,
        price,
        status: "processing",
        paymentStatus: "paid",
        paymentMethod: "points",
        paidAt: now,
        createdAt: now,
        updatedAt: now,
      };

      await firestore.collection("transactions").doc(orderId).set(transactionData);

      // ⚡ SIMULASI: Proses pengiriman pulsa
      console.log(`🚀 Processing points order: ${orderId}...`);

      setTimeout(async () => {
        try {
          const serialNumber = `SN-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

          await firestore.collection("transactions").doc(orderId).update({
            status: "success",
            serialNumber: serialNumber,
            updatedAt: new Date().toISOString(),
          });

          console.log(`✅ Points order ${orderId} completed! SN: ${serialNumber}`);
        } catch (err) {
          console.error(`❌ Failed to process points order ${orderId}:`, err);

          // Refund points on failure
          const userDoc = await firestore.collection("users").doc(req.user!.uid).get();
          const userData = userDoc.data();
          if (userData) {
            await firestore.collection("users").doc(req.user!.uid).update({
              points: (userData.points || 0) + pointsUsed,
              updatedAt: new Date().toISOString(),
            });
          }

          await firestore.collection("transactions").doc(orderId).update({
            status: "failed",
            updatedAt: new Date().toISOString(),
          });
        }
      }, 3000);

      res.json({ orderId, message: "Order created with points" });
    } catch (error) {
      console.error("Create points order error:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Midtrans Webhook Notification
  app.post("/api/midtrans/notification", async (req, res) => {
    try {
      const notification = req.body;
      const orderId = notification.order_id;
      const transactionStatus = notification.transaction_status;
      const fraudStatus = notification.fraud_status;

      console.log(`📬 Midtrans Webhook: ${orderId} - Status: ${transactionStatus}`);

      // Get transaction from Firestore
      const transactionDoc = await firestore.collection("transactions").doc(orderId).get();

      if (!transactionDoc.exists) {
        console.error(`Transaction not found: ${orderId}`);
        return res.status(404).json({ error: "Transaction not found" });
      }

      const now = new Date().toISOString();
      let updateData: Partial<Transaction> = { updatedAt: now };

      // Handle different transaction statuses
      if (transactionStatus === "capture" || transactionStatus === "settlement") {
        if (fraudStatus === "accept" || !fraudStatus) {
          updateData.paymentStatus = "paid";
          updateData.paidAt = now;
          updateData.paymentMethod = notification.payment_type;

          // ⚡ SIMULASI: Proses pengiriman pulsa
          // Nanti ganti logic ini ke API Digiflazz
          console.log(`🚀 Processing order: ${orderId}...`);

          // Simulasi delay 3 detik
          setTimeout(async () => {
            try {
              // Generate dummy Serial Number
              const serialNumber = `SN-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

              await firestore.collection("transactions").doc(orderId).update({
                status: "success",
                serialNumber: serialNumber,
                updatedAt: new Date().toISOString(),
              });

              console.log(`✅ Order ${orderId} completed! SN: ${serialNumber}`);
            } catch (err) {
              console.error(`❌ Failed to process order ${orderId}:`, err);
              await firestore.collection("transactions").doc(orderId).update({
                status: "failed",
                updatedAt: new Date().toISOString(),
              });
            }
          }, 3000);

          updateData.status = "processing";
        }
      } else if (transactionStatus === "pending") {
        updateData.paymentStatus = "unpaid";
      } else if (transactionStatus === "deny" || transactionStatus === "expire" || transactionStatus === "cancel") {
        updateData.paymentStatus = transactionStatus === "expire" ? "expired" : "cancelled";
        updateData.status = "failed";
      }

      await firestore.collection("transactions").doc(orderId).update(updateData);

      res.status(200).json({ message: "OK" });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Confirm payment (for development/testing - called from frontend after Snap success)
  app.post("/api/orders/:orderId/confirm-payment", authMiddleware, async (req, res) => {
    try {
      const { orderId } = req.params;

      const transactionDoc = await firestore.collection("transactions").doc(orderId).get();

      if (!transactionDoc.exists) {
        return res.status(404).json({ error: "Order not found" });
      }

      const transaction = transactionDoc.data();

      // Verify ownership
      if (transaction?.userId !== req.user!.uid) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Only confirm if still pending/unpaid
      if (transaction?.paymentStatus === "paid") {
        return res.json({ message: "Already paid", transaction });
      }

      const now = new Date().toISOString();

      // Update to paid & processing
      await firestore.collection("transactions").doc(orderId).update({
        paymentStatus: "paid",
        status: "processing",
        paidAt: now,
        updatedAt: now,
      });

      // ⚡ SIMULASI: Proses pengiriman pulsa
      console.log(`🚀 Processing confirmed order: ${orderId}...`);

      setTimeout(async () => {
        try {
          const serialNumber = `SN-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

          await firestore.collection("transactions").doc(orderId).update({
            status: "success",
            serialNumber: serialNumber,
            updatedAt: new Date().toISOString(),
          });

          console.log(`✅ Order ${orderId} completed! SN: ${serialNumber}`);
        } catch (err) {
          console.error(`❌ Failed to process order ${orderId}:`, err);
          await firestore.collection("transactions").doc(orderId).update({
            status: "failed",
            updatedAt: new Date().toISOString(),
          });
        }
      }, 3000);

      res.json({ message: "Payment confirmed", orderId });
    } catch (error) {
      console.error("Confirm payment error:", error);
      res.status(500).json({ error: "Failed to confirm payment" });
    }
  });

  // Get order status
  app.get("/api/orders/:orderId", authMiddleware, async (req, res) => {
    try {
      const { orderId } = req.params;
      const transactionDoc = await firestore.collection("transactions").doc(orderId).get();

      if (!transactionDoc.exists) {
        return res.status(404).json({ error: "Order not found" });
      }

      const transaction = transactionDoc.data();

      // Verify ownership
      if (transaction?.userId !== req.user!.uid) {
        return res.status(403).json({ error: "Forbidden" });
      }

      res.json({ transaction });
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ error: "Failed to get order" });
    }
  });

  // Get user's order history
  app.get("/api/orders", authMiddleware, async (req, res) => {
    try {
      const snapshot = await firestore
        .collection("transactions")
        .where("userId", "==", req.user!.uid)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

      const transactions = snapshot.docs.map((doc) => doc.data());

      res.json({ transactions });
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ error: "Failed to get orders" });
    }
  });

  // ============ PPOB Routes ============
  const {
    providers,
    ppobProducts,
    detectProvider,
    getProductsByProvider,
    getProvidersByType,
    generateSerialNumber
  } = await import("./ppob-data");

  // Get providers by type
  app.get("/api/ppob/providers", async (req, res) => {
    const { type } = req.query;

    if (type && typeof type === "string") {
      const filtered = getProvidersByType(type);
      return res.json(filtered);
    }

    res.json(providers);
  });

  // Detect provider from phone number
  app.get("/api/ppob/detect-provider", async (req, res) => {
    const { phone } = req.query;

    if (!phone || typeof phone !== "string") {
      return res.status(400).json({ error: "Phone number required" });
    }

    const provider = detectProvider(phone);
    res.json({ provider });
  });

  // Get products by provider
  app.get("/api/ppob/products", async (req, res) => {
    const { providerId, type } = req.query;

    if (providerId && typeof providerId === "string") {
      const products = getProductsByProvider(providerId, type as string | undefined);
      return res.json(products);
    }

    // Filter by type if provided
    if (type && typeof type === "string") {
      const filtered = ppobProducts.filter(p => p.type === type && p.isActive);
      return res.json(filtered);
    }

    res.json(ppobProducts.filter(p => p.isActive));
  });

  // Get single product
  app.get("/api/ppob/products/:id", async (req, res) => {
    const { id } = req.params;
    const product = ppobProducts.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  });

  // Create transaction (mock)
  app.post("/api/ppob/transaction", authMiddleware, async (req, res) => {
    try {
      const { productId, target } = req.body;

      if (!productId || !target) {
        return res.status(400).json({ error: "Product ID and target required" });
      }

      const product = ppobProducts.find(p => p.id === productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const provider = providers.find(p => p.id === product.providerId);
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }

      // Create transaction document
      const now = new Date().toISOString();
      const transactionId = `TRX${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      const transaction = {
        id: transactionId,
        userId: req.user!.uid,
        productId: product.id,
        productName: product.name,
        providerId: provider.id,
        providerName: provider.name,
        type: product.type,
        target,
        price: product.price,
        status: "processing" as const,
        createdAt: now,
        updatedAt: now,
      };

      // Save to Firestore
      await firestore.collection("transactions").doc(transactionId).set(transaction);

      // Simulate processing (in real world, call PPOB API here)
      setTimeout(async () => {
        const serialNumber = generateSerialNumber();
        await firestore.collection("transactions").doc(transactionId).update({
          status: "success",
          serialNumber,
          updatedAt: new Date().toISOString(),
        });
        console.log(`✅ Transaction ${transactionId} completed with SN: ${serialNumber}`);
      }, 2000); // 2 second delay to simulate processing

      console.log(`📝 Created transaction ${transactionId} for ${target}`);
      res.status(201).json({ transaction });
    } catch (error) {
      console.error("Create transaction error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get user's transactions
  app.get("/api/ppob/transactions", authMiddleware, async (req, res) => {
    try {
      const { limit = "20", type } = req.query;

      let query = firestore
        .collection("transactions")
        .where("userId", "==", req.user!.uid)
        .orderBy("createdAt", "desc")
        .limit(parseInt(limit as string, 10));

      const snapshot = await query.get();
      const transactions = snapshot.docs.map(doc => doc.data());

      // Filter by type if provided
      const filtered = type
        ? transactions.filter(t => t.type === type)
        : transactions;

      res.json(filtered);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get single transaction
  app.get("/api/ppob/transactions/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await firestore.collection("transactions").doc(id).get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      const transaction = doc.data();

      // Make sure user owns this transaction
      if (transaction?.userId !== req.user!.uid) {
        return res.status(403).json({ error: "Forbidden" });
      }

      res.json(transaction);
    } catch (error) {
      console.error("Get transaction error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============ Upload Routes ============

  // Upload banner image
  app.post("/api/upload/banner", authMiddleware, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Upload to Cloudinary
      const result = await uploadToCloudinary(req.file.buffer, "seavice/banners");

      // Update user's banner URL in Firestore
      await firestore.collection("users").doc(req.user!.uid).update({
        bannerUrl: result.url,
        updatedAt: new Date().toISOString(),
      });

      console.log(`✅ Uploaded banner for user ${req.user!.uid}`);
      res.json({ url: result.url });
    } catch (error) {
      console.error("Upload banner error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // Upload avatar image
  app.post("/api/upload/avatar", authMiddleware, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Upload to Cloudinary
      const result = await uploadAvatarToCloudinary(req.file.buffer, "seavice/avatars");

      // Update user's photo URL in Firestore
      await firestore.collection("users").doc(req.user!.uid).update({
        photoURL: result.url,
        updatedAt: new Date().toISOString(),
      });

      console.log(`✅ Uploaded avatar for user ${req.user!.uid}`);
      res.json({ url: result.url });
    } catch (error) {
      console.error("Upload avatar error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  return httpServer;
}
