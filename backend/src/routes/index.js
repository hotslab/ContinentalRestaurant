"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = __importDefault(require("@koa/router"));
const AuthentificationController_1 = __importDefault(require("../controllers/AuthentificationController"));
const router = new router_1.default();
router.get('/', AuthentificationController_1.default.hello);
router.get('/users', AuthentificationController_1.default.getUsers);
router.get('/users/:id', AuthentificationController_1.default.getUser);
exports.default = router;
