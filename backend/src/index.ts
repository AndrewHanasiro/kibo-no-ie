import { setGlobalOptions } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";

initializeApp();

setGlobalOptions({ maxInstances: 1 });

/**
 * Routes
 */
export { listProducts, updateProduct, createProduct } from "./product";
export { listWarning, createWarning } from "./warning";
export { listShop, updateShop, createShop } from "./shop";

