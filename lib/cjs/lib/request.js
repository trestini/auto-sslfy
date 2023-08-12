"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const request = axios_1.default.create();
request.interceptors.response.use((res) => {
    return res;
}, (error) => {
    console.debug("Request error: %o", error);
    return Promise.reject(error);
});
exports.default = request;
