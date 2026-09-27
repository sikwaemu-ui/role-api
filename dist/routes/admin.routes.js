"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const role_middleware_js_1 = require("../middleware/role.middleware.js");
const router = (0, express_1.Router)();
router.get("/dashboard", auth_middleware_js_1.authenticate, role_middleware_js_1.requireAdmin, (req, res) => {
    res.json({
        success: true,
        message: "Welcome to the admin dashboard",
        admin: req.user,
    });
});
exports.default = router;
