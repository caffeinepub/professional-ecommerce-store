import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Set "mo:core/Set";
import Order "mo:core/Order";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

actor {
  // Initialize mixins
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type UserProfile = {
    firstName : Text;
    lastName : Text;
    email : Text;
    transactions : [Transaction];
    wishList : [Text];
  };

  public type FileReference = { file : Storage.ExternalBlob };

  public type ProfileData = {
    principal : Principal;
    email : Text;
    fullName : Text;
    phone : Text;
    address : Text;
    registered : Time.Time;
  };

  public type Product = {
    id : Text;
    name : Text;
    description : Text;
    price : Nat;
    stock : Nat;
    category : Text;
    images : [Storage.ExternalBlob];
    ratings : [Nat];
    reviewCount : Nat;
    purchases : Nat;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Text.compare(product1.id, product2.id);
    };
  };

  public type CartItem = {
    productId : Text;
    quantity : Nat;
  };

  public type Transaction = {
    id : Text;
    items : [CartItem];
    total : Nat;
    date : Time.Time;
    status : TransactionStatus;
    paymentIntentId : Text;
  };

  public type TransactionStatus = {
    #pending;
    #completed;
    #cancelled;
  };

  public type StoreSettings = {
    currency : Text;
    shippingRegions : [Text];
    taxRate : Float;
  };

  public type OrderItem = {
    productId : Text;
    quantity : Nat;
    price : Nat;
  };

  public type Cart = {
    items : [CartItem];
    totalPrice : Nat;
    timestamp : Time.Time;
    appliedShippingMethod : ?Text;
  };

  // Storage
  let products = Map.empty<Text, Product>();
  let productFilters = Set.empty<Text>();
  let images = Map.empty<Text, FileReference>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let storeSettings = Map.empty<Text, StoreSettings>();
  let stripeSettings = Map.empty<Text, Stripe.StripeConfiguration>();
  let abandonedCarts = Map.empty<Principal, Cart>();
  let profiles = Map.empty<Principal, ProfileData>();

  func ensureUser(_ : Principal, userId : Principal) {
    switch (userProfiles.get(userId)) {
      case (null) {
        Runtime.trap("User not found or not authenticated. Please log in and try again.");
      };
      case (_) { () };
    };
  };

  func ensureAdmin(_ : Principal, adminId : Principal) {
    if (AccessControl.hasPermission(accessControlState, adminId, #admin)) {
      return;
    };
    Runtime.trap("Admin not found or not authenticated. Please log in and try again.");
  };

  func getNotEmptyCart(_ : Principal, userId : Principal) : Cart {
    switch (abandonedCarts.get(userId)) {
      case (?cart) { cart };
      case (null) {
        Runtime.trap("Cart not found or is empty! Please add items to your cart and try again.");
      };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Stripe API
  public query func isStripeConfigured() : async Bool {
    not stripeSettings.isEmpty();
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    ensureAdmin(caller, caller);
    stripeSettings.add("default", config);
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeSettings.get("default")) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  // Contact Info
  public shared ({ caller }) func saveMyContactInfo(email : Text, name : Text, phone : Text, address : Text) : async () {
    if (email == "") {
      Runtime.trap("Email address is required");
    };

    let newRecord : ProfileData = {
      principal = caller;
      email;
      fullName = name;
      phone;
      address;
      registered = Time.now();
    };

    profiles.add(caller, newRecord);
  };

  public query ({ caller }) func getMyContactInfo() : async ?ProfileData {
    profiles.get(caller);
  };

  public query ({ caller }) func listAllUserContacts() : async [ProfileData] {
    ensureAdmin(caller, caller);
    profiles.values().toArray();
  };

  // Product management
  public shared ({ caller }) func addProduct(product : Product) : async () {
    ensureAdmin(caller, caller);
    if (products.containsKey(product.id)) { Runtime.trap("Product ID already exists") };
    products.add(product.id, product);
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    ensureAdmin(caller, caller);
    if (not products.containsKey(product.id)) { Runtime.trap("Product does not exist") };
    products.add(product.id, product);
  };

  public shared ({ caller }) func deleteProduct(productId : Text) : async () {
    ensureAdmin(caller, caller);
    if (not products.containsKey(productId)) { Runtime.trap("Product does not exist") };
    products.remove(productId);
  };

  public query ({ caller }) func getProduct(productId : Text) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query func getProductsByCategory(category : Text) : async [Product] {
    let categoryProducts = products.filter(
      func(_id, product) {
        product.category == category;
      }
    );
    categoryProducts.values().toArray().sort();
  };

  public query func getProductsByPriceRange(minPrice : Nat, maxPrice : Nat) : async [Product] {
    let productsInRange = products.filter(
      func(_id, product) {
        product.price >= minPrice and product.price <= maxPrice
      }
    );
    productsInRange.values().toArray().sort();
  };

  public query func getTopRatedProducts() : async [Product] {
    let ratedProducts = products.filter(
      func(_id, _) {
        true;
      }
    );
    ratedProducts.values().toArray().sort();
  };

  public query func getBestsellers() : async [Product] {
    let allProductsList = List.empty<Product>();
    for ((_, product) in products.entries()) {
      allProductsList.add(product);
    };
    allProductsList.toArray().sort();
  };
};
