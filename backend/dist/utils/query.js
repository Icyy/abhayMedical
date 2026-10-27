"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qs = void 0;
const qs = (val) => Array.isArray(val) ? String(val[0]) : String(val ?? '');
exports.qs = qs;
