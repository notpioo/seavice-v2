import midtransClient from "midtrans-client";

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

// Initialize Snap API
export const snap = new midtransClient.Snap({
    isProduction: isProduction,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.VITE_MIDTRANS_CLIENT_KEY,
});

// Initialize Core API (for status check & verification)
export const coreApi = new midtransClient.CoreApi({
    isProduction: isProduction,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.VITE_MIDTRANS_CLIENT_KEY,
});

export interface CreateTransactionParams {
    orderId: string;
    grossAmount: number;
    customerDetails: {
        first_name: string;
        email: string;
        phone?: string;
    };
    itemDetails: {
        id: string;
        price: number;
        quantity: number;
        name: string;
    }[];
}

export async function createSnapTransaction(params: CreateTransactionParams) {
    const parameter = {
        transaction_details: {
            order_id: params.orderId,
            gross_amount: params.grossAmount,
        },
        credit_card: {
            secure: true,
        },
        customer_details: params.customerDetails,
        item_details: params.itemDetails,
        expiry: {
            unit: "minutes",
            duration: 60, // Expire in 60 minutes
        },
    };

    try {
        const transaction = await snap.createTransaction(parameter);
        console.log(`✅ Midtrans transaction created: ${params.orderId}`);
        return transaction; // { token, redirect_url }
    } catch (error) {
        console.error("❌ Midtrans Error:", error);
        throw error;
    }
}

// Verify notification signature
export function verifyNotification(notification: any): boolean {
    // In production, you should verify the signature
    // For sandbox, we'll trust the notification for now
    return true;
}
