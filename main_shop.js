"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDatabase = setupDatabase;
exports.fetchPaginatedData = fetchPaginatedData;
exports.fetchAndStoreProducts = fetchAndStoreProducts;
exports.fetchAndStoreOrders = fetchAndStoreOrders;
exports.getProducts = getProducts;
exports.getOrders = getOrders;
exports.main = main;
var axios_1 = require("axios");
//import sqlite3 from 'sqlite3';
var sqlite3 = require("sqlite3");
var sqlite_1 = require("sqlite");
// Constantes da API
var SHOPIFY_API_URL = 'https://3e58bf-fd.myshopify.com/admin/api/2024-07/graphql.json';
var SHOPIFY_ACCESS_TOKEN = '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';
var headers = {
    'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
};
// Conectar ao banco de dados SQLite
function setupDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, sqlite_1.open)({
                        filename: 'shopify.db',
                        driver: sqlite3.Database,
                    })];
                case 1:
                    db = _a.sent();
                    // Criar tabelas de produtos e pedidos
                    return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS products (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      platform_id TEXT UNIQUE NOT NULL,\n      name TEXT NOT NULL\n    );\n  ")];
                case 2:
                    // Criar tabelas de produtos e pedidos
                    _a.sent();
                    return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS orders (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      platform_id TEXT UNIQUE NOT NULL\n    );\n  ")];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS line_items (\n      order_id INTEGER,\n      product_id INTEGER,\n      FOREIGN KEY (order_id) REFERENCES orders(id),\n      FOREIGN KEY (product_id) REFERENCES products(id)\n    );\n  ")];
                case 4:
                    _a.sent();
                    return [2 /*return*/, db];
            }
        });
    });
}
// Função para buscar dados paginados da API do Shopify
function fetchPaginatedData(endpoint_1) {
    return __awaiter(this, arguments, void 0, function (endpoint, limit) {
        var url, data, hasNextPage, params, response, nextLink;
        var _a;
        if (limit === void 0) { limit = 50; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    url = "".concat(SHOPIFY_API_URL, "/").concat(endpoint, ".json");
                    data = [];
                    hasNextPage = true;
                    params = { limit: limit };
                    _b.label = 1;
                case 1:
                    if (!hasNextPage) return [3 /*break*/, 3];
                    return [4 /*yield*/, axios_1.default.get(url, { headers: headers, params: params })];
                case 2:
                    response = _b.sent();
                    data = data.concat(response.data[endpoint]);
                    nextLink = (_a = response.headers.link) === null || _a === void 0 ? void 0 : _a.match(/<(.*?)>; rel="next"/);
                    hasNextPage = !!nextLink;
                    url = nextLink ? nextLink[1] : '';
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/, data];
            }
        });
    });
}
// Função para buscar e armazenar produtos no banco de dados
function fetchAndStoreProducts(db) {
    return __awaiter(this, void 0, void 0, function () {
        var products, _i, products_1, product, platform_id, name_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchPaginatedData('products')];
                case 1:
                    products = _a.sent();
                    _i = 0, products_1 = products;
                    _a.label = 2;
                case 2:
                    if (!(_i < products_1.length)) return [3 /*break*/, 5];
                    product = products_1[_i];
                    platform_id = product.id;
                    name_1 = product.title;
                    return [4 /*yield*/, db.run('INSERT OR IGNORE INTO products (platform_id, name) VALUES (?, ?)', platform_id, name_1)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Função para buscar e armazenar pedidos no banco de dados
function fetchAndStoreOrders(db) {
    return __awaiter(this, void 0, void 0, function () {
        var orders, _i, orders_1, order, platform_id, orderId, _a, _b, item, productId, productDb, productDbId;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, fetchPaginatedData('orders')];
                case 1:
                    orders = _c.sent();
                    _i = 0, orders_1 = orders;
                    _c.label = 2;
                case 2:
                    if (!(_i < orders_1.length)) return [3 /*break*/, 10];
                    order = orders_1[_i];
                    platform_id = order.id;
                    return [4 /*yield*/, db.run('INSERT OR IGNORE INTO orders (platform_id) VALUES (?)', platform_id)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, db.get('SELECT id FROM orders WHERE platform_id = ?', platform_id)];
                case 4:
                    orderId = (_c.sent()).id;
                    _a = 0, _b = order.line_items;
                    _c.label = 5;
                case 5:
                    if (!(_a < _b.length)) return [3 /*break*/, 9];
                    item = _b[_a];
                    productId = item.product_id;
                    if (!productId) return [3 /*break*/, 8];
                    return [4 /*yield*/, db.get('SELECT id FROM products WHERE platform_id = ?', productId)];
                case 6:
                    productDb = _c.sent();
                    productDbId = productDb ? productDb.id : null;
                    // Inserir line_item
                    return [4 /*yield*/, db.run('INSERT INTO line_items (order_id, product_id) VALUES (?, ?)', orderId, productDbId)];
                case 7:
                    // Inserir line_item
                    _c.sent();
                    _c.label = 8;
                case 8:
                    _a++;
                    return [3 /*break*/, 5];
                case 9:
                    _i++;
                    return [3 /*break*/, 2];
                case 10: return [2 /*return*/];
            }
        });
    });
}
// Função para buscar todos os produtos
function getProducts(db) {
    return __awaiter(this, void 0, void 0, function () {
        var products;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.all('SELECT id, platform_id, name FROM products')];
                case 1:
                    products = _a.sent();
                    return [2 /*return*/, products.map(function (p) { return ({
                            id: String(p.id),
                            platform_id: p.platform_id,
                            name: p.name,
                        }); })];
            }
        });
    });
}
// Função para buscar todos os pedidos
function getOrders(db) {
    return __awaiter(this, void 0, void 0, function () {
        var orders, result, _i, orders_2, order, lineItems, formattedLineItems;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.all('SELECT id, platform_id FROM orders')];
                case 1:
                    orders = _a.sent();
                    result = [];
                    _i = 0, orders_2 = orders;
                    _a.label = 2;
                case 2:
                    if (!(_i < orders_2.length)) return [3 /*break*/, 6];
                    order = orders_2[_i];
                    return [4 /*yield*/, db.all('SELECT product_id FROM line_items WHERE order_id = ?', order.id)];
                case 3:
                    lineItems = _a.sent();
                    return [4 /*yield*/, Promise.all(lineItems.map(function (item) { return __awaiter(_this, void 0, void 0, function () {
                            var productId, product;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        productId = item.product_id;
                                        if (!productId) return [3 /*break*/, 2];
                                        return [4 /*yield*/, db.get('SELECT platform_id FROM products WHERE id = ?', productId)];
                                    case 1:
                                        product = _a.sent();
                                        return [2 /*return*/, { product_id: product ? String(product.platform_id) : null }];
                                    case 2: return [2 /*return*/, { product_id: null }];
                                }
                            });
                        }); }))];
                case 4:
                    formattedLineItems = _a.sent();
                    result.push({
                        id: String(order.id),
                        platform_id: order.platform_id,
                        line_items: formattedLineItems,
                    });
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 2];
                case 6: return [2 /*return*/, result];
            }
        });
    });
}
// Função principal para rodar o código
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var db, products, orders;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, setupDatabase()];
                case 1:
                    db = _a.sent();
                    // Buscar e armazenar produtos e pedidos
                    return [4 /*yield*/, fetchAndStoreProducts(db)];
                case 2:
                    // Buscar e armazenar produtos e pedidos
                    _a.sent();
                    return [4 /*yield*/, fetchAndStoreOrders(db)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, getProducts(db)];
                case 4:
                    products = _a.sent();
                    console.log('Products:', products);
                    return [4 /*yield*/, getOrders(db)];
                case 5:
                    orders = _a.sent();
                    console.log('Orders:', orders);
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error);
