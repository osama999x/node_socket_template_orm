"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logController_1 = __importDefault(require("./logController"));
const logRouter = express_1.default.Router();
logRouter.route("/").post(logController_1.default.create).get(logController_1.default.all);
exports.default = logRouter;
