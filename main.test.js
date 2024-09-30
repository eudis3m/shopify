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
var main_shop_1 = require("./main_shop");
var sqlite3 = require("sqlite3");
var sqlite_1 = require("sqlite");
var db;
beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, sqlite_1.open)({
                    filename: ':memory:', // Usando um banco de dados na memória para testes
                    driver: sqlite3.Database,
                })];
            case 1:
                db = _a.sent();
                return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS products (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      platform_id TEXT UNIQUE NOT NULL,\n      name TEXT NOT NULL\n    );\n  ")];
            case 2:
                _a.sent();
                return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS orders (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      platform_id TEXT UNIQUE NOT NULL\n    );\n  ")];
            case 3:
                _a.sent();
                return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS line_items (\n      order_id INTEGER,\n      product_id INTEGER,\n      FOREIGN KEY (order_id) REFERENCES orders(id),\n      FOREIGN KEY (product_id) REFERENCES products(id)\n    );\n  ")];
            case 4:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db.close()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
test('should store and retrieve products correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
    var products;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // Inserir um produto de exemplo
            return [4 /*yield*/, db.run('INSERT INTO products (platform_id, name) VALUES (?, ?)', '123', 'Test Product')];
            case 1:
                // Inserir um produto de exemplo
                _a.sent();
                return [4 /*yield*/, (0, main_shop_1.getProducts)(db)];
            case 2:
                products = _a.sent();
                expect(products.length).toBe(1);
                expect(products[0]).toEqual({
                    id: '1',
                    platform_id: '123',
                    name: 'Test Product'
                });
                return [2 /*return*/];
        }
    });
}); });
test('should store and retrieve orders with line items', function () { return __awaiter(void 0, void 0, void 0, function () {
    var orders;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // Inserir um pedido e um line_item de exemplo
            return [4 /*yield*/, db.run('INSERT INTO orders (platform_id) VALUES (?)', '12345')];
            case 1:
                // Inserir um pedido e um line_item de exemplo
                _a.sent();
                return [4 /*yield*/, db.run('INSERT INTO line_items (order_id, product_id) VALUES (?, ?)', 1, 1)];
            case 2:
                _a.sent();
                return [4 /*yield*/, (0, main_shop_1.getOrders)(db)];
            case 3:
                orders = _a.sent();
                expect(orders.length).toBe(1);
                expect(orders[0].line_items.length).toBe(1);
                expect(orders[0].line_items[0].product_id).toBe('123');
                return [2 /*return*/];
        }
    });
}); });
