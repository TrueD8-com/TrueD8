"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var myError = /** @class */ (function (_super) {
    __extends(myError, _super);
    function myError(messageEnglish, statusCode, clientCode, clientMessage, title) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, messageEnglish) || this;
        _this.messageEnglish = messageEnglish;
        _this.statusCode = statusCode;
        _this.clientCode = clientCode;
        _this.clientMessage = clientMessage;
        _this.title = title;
        Object.setPrototypeOf(_this, _newTarget.prototype); // restore prototype chain
        return _this;
    }
    return myError;
}(Error));
exports.default = myError;
//# sourceMappingURL=myError.js.map