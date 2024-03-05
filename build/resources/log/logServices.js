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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../../db"));
const log_1 = require("../../entities/log");
const logServices = {
    create: (page) => __awaiter(void 0, void 0, void 0, function* () {
        // const date = moment().format("DD-MM-YYYY");
        const date = "25-01-2024";
        const dateEntryExists = yield db_1.default.manager.findOne(log_1.Log, {
            where: { page, date },
        });
        if (dateEntryExists) {
            return yield db_1.default.manager.update(log_1.Log, { date }, { count: dateEntryExists.count + 1 });
        }
        const log = db_1.default.manager.create(log_1.Log, {
            page,
            date,
        });
        return yield db_1.default.manager.save(log_1.Log, log);
    }),
    getAll: () => __awaiter(void 0, void 0, void 0, function* () {
        return yield db_1.default.manager.find(log_1.Log);
    }),
};
exports.default = logServices;
