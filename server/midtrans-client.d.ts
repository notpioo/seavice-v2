declare module "midtrans-client" {
    interface SnapConfig {
        isProduction: boolean;
        serverKey: string | undefined;
        clientKey: string | undefined;
    }

    interface CoreApiConfig {
        isProduction: boolean;
        serverKey: string | undefined;
        clientKey: string | undefined;
    }

    interface TransactionDetails {
        order_id: string;
        gross_amount: number;
    }

    interface CustomerDetails {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
    }

    interface ItemDetail {
        id: string;
        price: number;
        quantity: number;
        name: string;
    }

    interface TransactionParameter {
        transaction_details: TransactionDetails;
        credit_card?: { secure: boolean };
        customer_details?: CustomerDetails;
        item_details?: ItemDetail[];
        expiry?: { unit: string; duration: number };
    }

    interface SnapTransaction {
        token: string;
        redirect_url: string;
    }

    class Snap {
        constructor(config: SnapConfig);
        createTransaction(parameter: TransactionParameter): Promise<SnapTransaction>;
    }

    class CoreApi {
        constructor(config: CoreApiConfig);
        transaction: {
            status(orderId: string): Promise<any>;
            notification(notification: any): Promise<any>;
        };
    }

    export { Snap, CoreApi };
}
