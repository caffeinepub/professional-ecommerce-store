import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface ProfileData {
    principal: Principal;
    fullName: string;
    email: string;
    address: string;
    phone: string;
    registered: Time;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Product {
    id: string;
    name: string;
    ratings: Array<bigint>;
    description: string;
    stock: bigint;
    purchases: bigint;
    category: string;
    price: bigint;
    reviewCount: bigint;
    images: Array<ExternalBlob>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(product: Product): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteProduct(productId: string): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getBestsellers(): Promise<Array<Product>>;
    getCallerUserRole(): Promise<UserRole>;
    getMyContactInfo(): Promise<ProfileData | null>;
    getProduct(productId: string): Promise<Product>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getProductsByPriceRange(minPrice: bigint, maxPrice: bigint): Promise<Array<Product>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTopRatedProducts(): Promise<Array<Product>>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listAllUserContacts(): Promise<Array<ProfileData>>;
    saveMyContactInfo(email: string, name: string, phone: string, address: string): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateProduct(product: Product): Promise<void>;
}
