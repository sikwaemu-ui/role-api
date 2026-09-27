"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
router.get("/profile", auth_middleware_js_1.authenticate, (req, res) => {
    res.json({
        success: true,
        message: "Authenticated user",
        user: req.user,
    });
});
exports.default = router;
