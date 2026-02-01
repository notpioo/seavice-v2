import type { Provider, PPOBProduct } from "@shared/schema";

// ============ PROVIDERS ============
export const providers: Provider[] = [
    // Pulsa Providers
    {
        id: "telkomsel",
        name: "Telkomsel",
        code: "TELKOMSEL",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Telkomsel_2021_icon.svg/120px-Telkomsel_2021_icon.svg.png",
        type: "pulsa",
        prefixes: ["0811", "0812", "0813", "0821", "0822", "0823", "0851", "0852", "0853"],
    },
    {
        id: "indosat",
        name: "Indosat",
        code: "INDOSAT",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Indosat_Ooredoo_Hutchison.svg/120px-Indosat_Ooredoo_Hutchison.svg.png",
        type: "pulsa",
        prefixes: ["0814", "0815", "0816", "0855", "0856", "0857", "0858"],
    },
    {
        id: "xl",
        name: "XL Axiata",
        code: "XL",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/XL_logo_2016.svg/120px-XL_logo_2016.svg.png",
        type: "pulsa",
        prefixes: ["0817", "0818", "0819", "0859", "0877", "0878"],
    },
    {
        id: "axis",
        name: "Axis",
        code: "AXIS",
        image: "https://upload.wikimedia.org/wikipedia/id/thumb/6/66/Axis_logo.svg/120px-Axis_logo.svg.png",
        type: "pulsa",
        prefixes: ["0831", "0832", "0833", "0838"],
    },
    {
        id: "tri",
        name: "Tri (3)",
        code: "TRI",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/3_%28telecommunications%29_logo.svg/120px-3_%28telecommunications%29_logo.svg.png",
        type: "pulsa",
        prefixes: ["0895", "0896", "0897", "0898", "0899"],
    },
    {
        id: "smartfren",
        name: "Smartfren",
        code: "SMARTFREN",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Smartfren_logo_2022.svg/120px-Smartfren_logo_2022.svg.png",
        type: "pulsa",
        prefixes: ["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888", "0889"],
    },
    // PLN Provider
    {
        id: "pln",
        name: "PLN",
        code: "PLN",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Logo_PLN.svg/120px-Logo_PLN.svg.png",
        type: "pln",
    },
];

// ============ PPOB PRODUCTS ============
export const ppobProducts: PPOBProduct[] = [
    // Telkomsel Pulsa
    { id: "tsel-5k", name: "Pulsa 5.000", price: 6500, basePrice: 5500, providerId: "telkomsel", type: "pulsa", category: "reguler", isActive: true },
    { id: "tsel-10k", name: "Pulsa 10.000", price: 11500, basePrice: 10500, providerId: "telkomsel", type: "pulsa", category: "reguler", isActive: true },
    { id: "tsel-15k", name: "Pulsa 15.000", price: 16500, basePrice: 15500, providerId: "telkomsel", type: "pulsa", category: "reguler", isActive: true },
    { id: "tsel-20k", name: "Pulsa 20.000", price: 21500, basePrice: 20500, providerId: "telkomsel", type: "pulsa", category: "reguler", isActive: true },
    { id: "tsel-25k", name: "Pulsa 25.000", price: 26500, basePrice: 25500, providerId: "telkomsel", type: "pulsa", category: "reguler", isActive: true },
    { id: "tsel-50k", name: "Pulsa 50.000", price: 51500, basePrice: 50500, providerId: "telkomsel", type: "pulsa", category: "reguler", isActive: true },
    { id: "tsel-100k", name: "Pulsa 100.000", price: 101500, basePrice: 100500, providerId: "telkomsel", type: "pulsa", category: "reguler", isActive: true },

    // Indosat Pulsa
    { id: "isat-5k", name: "Pulsa 5.000", price: 6000, basePrice: 5200, providerId: "indosat", type: "pulsa", category: "reguler", isActive: true },
    { id: "isat-10k", name: "Pulsa 10.000", price: 11000, basePrice: 10200, providerId: "indosat", type: "pulsa", category: "reguler", isActive: true },
    { id: "isat-25k", name: "Pulsa 25.000", price: 26000, basePrice: 25200, providerId: "indosat", type: "pulsa", category: "reguler", isActive: true },
    { id: "isat-50k", name: "Pulsa 50.000", price: 51000, basePrice: 50200, providerId: "indosat", type: "pulsa", category: "reguler", isActive: true },
    { id: "isat-100k", name: "Pulsa 100.000", price: 101000, basePrice: 100200, providerId: "indosat", type: "pulsa", category: "reguler", isActive: true },

    // XL Pulsa
    { id: "xl-5k", name: "Pulsa 5.000", price: 6200, basePrice: 5300, providerId: "xl", type: "pulsa", category: "reguler", isActive: true },
    { id: "xl-10k", name: "Pulsa 10.000", price: 11200, basePrice: 10300, providerId: "xl", type: "pulsa", category: "reguler", isActive: true },
    { id: "xl-25k", name: "Pulsa 25.000", price: 26200, basePrice: 25300, providerId: "xl", type: "pulsa", category: "reguler", isActive: true },
    { id: "xl-50k", name: "Pulsa 50.000", price: 51200, basePrice: 50300, providerId: "xl", type: "pulsa", category: "reguler", isActive: true },
    { id: "xl-100k", name: "Pulsa 100.000", price: 101200, basePrice: 100300, providerId: "xl", type: "pulsa", category: "reguler", isActive: true },

    // Axis Pulsa
    { id: "axis-5k", name: "Pulsa 5.000", price: 6000, basePrice: 5100, providerId: "axis", type: "pulsa", category: "reguler", isActive: true },
    { id: "axis-10k", name: "Pulsa 10.000", price: 11000, basePrice: 10100, providerId: "axis", type: "pulsa", category: "reguler", isActive: true },
    { id: "axis-25k", name: "Pulsa 25.000", price: 26000, basePrice: 25100, providerId: "axis", type: "pulsa", category: "reguler", isActive: true },
    { id: "axis-50k", name: "Pulsa 50.000", price: 51000, basePrice: 50100, providerId: "axis", type: "pulsa", category: "reguler", isActive: true },
    { id: "axis-100k", name: "Pulsa 100.000", price: 101000, basePrice: 100100, providerId: "axis", type: "pulsa", category: "reguler", isActive: true },

    // Tri Pulsa
    { id: "tri-5k", name: "Pulsa 5.000", price: 5800, basePrice: 5000, providerId: "tri", type: "pulsa", category: "reguler", isActive: true },
    { id: "tri-10k", name: "Pulsa 10.000", price: 10800, basePrice: 10000, providerId: "tri", type: "pulsa", category: "reguler", isActive: true },
    { id: "tri-25k", name: "Pulsa 25.000", price: 25800, basePrice: 25000, providerId: "tri", type: "pulsa", category: "reguler", isActive: true },
    { id: "tri-50k", name: "Pulsa 50.000", price: 50800, basePrice: 50000, providerId: "tri", type: "pulsa", category: "reguler", isActive: true },
    { id: "tri-100k", name: "Pulsa 100.000", price: 100800, basePrice: 100000, providerId: "tri", type: "pulsa", category: "reguler", isActive: true },

    // Smartfren Pulsa
    { id: "sf-5k", name: "Pulsa 5.000", price: 5900, basePrice: 5100, providerId: "smartfren", type: "pulsa", category: "reguler", isActive: true },
    { id: "sf-10k", name: "Pulsa 10.000", price: 10900, basePrice: 10100, providerId: "smartfren", type: "pulsa", category: "reguler", isActive: true },
    { id: "sf-25k", name: "Pulsa 25.000", price: 25900, basePrice: 25100, providerId: "smartfren", type: "pulsa", category: "reguler", isActive: true },
    { id: "sf-50k", name: "Pulsa 50.000", price: 50900, basePrice: 50100, providerId: "smartfren", type: "pulsa", category: "reguler", isActive: true },
    { id: "sf-100k", name: "Pulsa 100.000", price: 100900, basePrice: 100100, providerId: "smartfren", type: "pulsa", category: "reguler", isActive: true },

    // Telkomsel Kuota
    { id: "tsel-1gb", name: "Kuota 1GB", description: "Masa aktif 30 hari", price: 15000, basePrice: 13000, providerId: "telkomsel", type: "kuota", category: "reguler", isActive: true },
    { id: "tsel-2gb", name: "Kuota 2GB", description: "Masa aktif 30 hari", price: 25000, basePrice: 22000, providerId: "telkomsel", type: "kuota", category: "reguler", isActive: true },
    { id: "tsel-5gb", name: "Kuota 5GB", description: "Masa aktif 30 hari", price: 50000, basePrice: 45000, providerId: "telkomsel", type: "kuota", category: "reguler", isActive: true },
    { id: "tsel-10gb", name: "Kuota 10GB", description: "Masa aktif 30 hari", price: 85000, basePrice: 78000, providerId: "telkomsel", type: "kuota", category: "reguler", isActive: true },
    { id: "tsel-20gb", name: "Kuota 20GB", description: "Masa aktif 30 hari", price: 150000, basePrice: 140000, providerId: "telkomsel", type: "kuota", category: "reguler", isActive: true },

    // Indosat Kuota  
    { id: "isat-1gb", name: "Kuota 1GB", description: "Masa aktif 30 hari", price: 12000, basePrice: 10000, providerId: "indosat", type: "kuota", category: "reguler", isActive: true },
    { id: "isat-3gb", name: "Kuota 3GB", description: "Masa aktif 30 hari", price: 30000, basePrice: 26000, providerId: "indosat", type: "kuota", category: "reguler", isActive: true },
    { id: "isat-6gb", name: "Kuota 6GB", description: "Masa aktif 30 hari", price: 55000, basePrice: 48000, providerId: "indosat", type: "kuota", category: "reguler", isActive: true },
    { id: "isat-10gb", name: "Kuota 10GB", description: "Masa aktif 30 hari", price: 80000, basePrice: 72000, providerId: "indosat", type: "kuota", category: "reguler", isActive: true },

    // XL Kuota
    { id: "xl-1gb", name: "Kuota 1GB", description: "Masa aktif 30 hari", price: 14000, basePrice: 11500, providerId: "xl", type: "kuota", category: "reguler", isActive: true },
    { id: "xl-3gb", name: "Kuota 3GB", description: "Masa aktif 30 hari", price: 32000, basePrice: 27000, providerId: "xl", type: "kuota", category: "reguler", isActive: true },
    { id: "xl-8gb", name: "Kuota 8GB", description: "Masa aktif 30 hari", price: 65000, basePrice: 57000, providerId: "xl", type: "kuota", category: "reguler", isActive: true },
    { id: "xl-15gb", name: "Kuota 15GB", description: "Masa aktif 30 hari", price: 110000, basePrice: 98000, providerId: "xl", type: "kuota", category: "reguler", isActive: true },

    // PLN Token
    { id: "pln-20k", name: "Token 20.000", description: "±14 kWh", price: 22000, basePrice: 20500, providerId: "pln", type: "pln", category: "token", isActive: true },
    { id: "pln-50k", name: "Token 50.000", description: "±36 kWh", price: 52000, basePrice: 50500, providerId: "pln", type: "pln", category: "token", isActive: true },
    { id: "pln-100k", name: "Token 100.000", description: "±72 kWh", price: 102000, basePrice: 100500, providerId: "pln", type: "pln", category: "token", isActive: true },
    { id: "pln-200k", name: "Token 200.000", description: "±145 kWh", price: 202000, basePrice: 200500, providerId: "pln", type: "pln", category: "token", isActive: true },
    { id: "pln-500k", name: "Token 500.000", description: "±365 kWh", price: 502000, basePrice: 500500, providerId: "pln", type: "pln", category: "token", isActive: true },
    { id: "pln-1jt", name: "Token 1.000.000", description: "±730 kWh", price: 1002000, basePrice: 1000500, providerId: "pln", type: "pln", category: "token", isActive: true },
];

// Helper: Detect provider from phone number
export function detectProvider(phoneNumber: string): Provider | null {
    const cleanNumber = phoneNumber.replace(/\D/g, "");

    for (const provider of providers) {
        if (provider.prefixes) {
            for (const prefix of provider.prefixes) {
                if (cleanNumber.startsWith(prefix) || cleanNumber.startsWith(prefix.replace("0", "62"))) {
                    return provider;
                }
            }
        }
    }

    return null;
}

// Helper: Get products by provider and type
export function getProductsByProvider(providerId: string, type?: string): PPOBProduct[] {
    return ppobProducts.filter(p =>
        p.providerId === providerId &&
        p.isActive &&
        (type ? p.type === type : true)
    );
}

// Helper: Get providers by type
export function getProvidersByType(type: string): Provider[] {
    return providers.filter(p => p.type === type);
}

// Helper: Format price to Rupiah
export function formatRupiah(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// Helper: Generate mock serial number
export function generateSerialNumber(): string {
    const chars = "0123456789";
    let result = "";
    for (let i = 0; i < 20; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
