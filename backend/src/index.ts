import { setGlobalOptions } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";

initializeApp();

setGlobalOptions({ maxInstances: 1 });

/**
 * Routes
 */
export { listProducts, updateProduct, createProduct, deleteProduct, onProductUpdated } from "./product";
export { listWarning, createWarning, deleteWarning } from "./warning";
export { listShop, updateShop, createShop, deleteShop } from "./shop";

