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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.provideCertificate = exports.BaseSource = void 0;
const util_1 = require("./lib/util");
const mkcert_1 = __importDefault(require("./mkcert"));
var source_1 = require("./mkcert/source");
Object.defineProperty(exports, "BaseSource", { enumerable: true, get: function () { return source_1.BaseSource; } });
function provideCertificate(options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const { hosts = [] } = options, mkcertOptions = __rest(options, ["hosts"]);
        const mkcert = mkcert_1.default.create(mkcertOptions);
        yield mkcert.init();
        const allHosts = [...(0, util_1.getDefaultHosts)(), ...hosts];
        const uniqueHosts = Array.from(new Set(allHosts)).filter((item) => !!item);
        const certificate = yield mkcert.install(uniqueHosts);
        return {
            key: certificate.key && Buffer.from(certificate.key),
            cert: certificate.cert && Buffer.from(certificate.cert),
        };
    });
}
exports.provideCertificate = provideCertificate;
