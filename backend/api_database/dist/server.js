"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./utils/db");
const routes_1 = require("./routes");
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
async function main() {
    await (0, db_1.initDB)();
    app.use('/api/auth', routes_1.authRoutes);
    app.get('/', (req, res) => {
        res.json({ message: 'API is running' });
    });
    app.listen(port, () => {
        console.log(`Server on http://localhost: ${port}`);
    });
}
main().catch(console.error);
