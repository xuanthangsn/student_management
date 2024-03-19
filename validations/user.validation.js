const { body, query } = require("express-validator");
const customDateValidation = require('../helpers/customDateValidation');

module.exports = {
  update: [
    body("username").optional().trim().notEmpty().isString(),
    body("password").optional().trim().notEmpty().isString(),
    body("firstname").optional().trim().notEmpty().isString(),
    body("lastname").optional().trim().notEmpty().isString(),
    body("phone_number").optional().trim().notEmpty().isString(),
    body("gender").optional().isIn(["male", "female"]),
  ],
  getAll: [
    query("id")
      .custom((value) => {
        if (isNaN(value) && typeof value !== "object") {
          throw new Error("Invalid value for field 'id'");
        }
        if (typeof value === "object") {
          let ltCount = 0;
          let gtCount = 0;
          Object.keys(value).forEach((op) => {
            if (op !== "lt" && op !== "lte" && op !== "gt" && op !== "gte")
              throw new Error("Invalid operator");
            if (op === "lt" || op === "lte") {
              ltCount++;
              if (ltCount > 1)
                throw new Error("There is more than 1 'less than' operator");
            }
            if (op === "gt" || op === "gte") {
              gtCount++;
              if (gtCount > 1)
                throw new Error("There is more than 1 'greater than' operator");
            }
            if (isNaN(value[op]))
              throw new Error(`Invalid value for operator ${op}`);
          });
        }
        return true;
      })
      .customSanitizer((value) => {
        if (typeof value !== "object") return { eq: value };
        return value;
      })
      .optional(),
    query("email")
      .isString()
      .customSanitizer((value) => {
        return { like: value };
      })
      .optional(),
    query("email_verified")
      .isBoolean()
      .customSanitizer((value) => {
        return { eq: value };
      })
      .optional(),
    query("firstname")
      .isString()
      .customSanitizer((value) => {
        return { like: value };
      })
      .optional(),
    query("lastname")
      .isString()
      .customSanitizer((value) => {
        return { like: value };
      })
      .optional(),
    query("phone_number")
      .isString()
      .customSanitizer((value) => {
        return { like: value };
      })
      .optional(),
    query("gender")
      .isIn(["male", "female"])
      .customSanitizer((value) => {
        return { eq: value };
      })
      .optional(),
    query("role")
      .isIn(["admin", "qlht"])
      .customSanitizer((value) => {
        return { eq: value };
      })
      .optional(),

    query("updated_by")
      .isNumeric()
      .customSanitizer((value) => {
        return { eq: value };
      })
      .optional(),
    query("updated_at")
      .custom(customDateValidation)
      .customSanitizer((value) => {
        if (typeof value !== "object") return { eq: value };
        return value;
      })
      .optional(),
    query("deleted_by")
      .isNumeric()
      .customSanitizer((value) => {
        return { eq: value };
      })
      .optional(),
    query("deleted_at")
      .custom(customDateValidation)
      .customSanitizer((value) => {
        if (typeof value !== "object") return { eq: value };
        return value;
      })
      .optional(),
    query("created_by")
      .isNumeric()
      .customSanitizer((value) => {
        return { eq: value };
      })
      .optional(),
    query("created_at")
      .custom(customDateValidation)
      .customSanitizer((value) => {
        if (typeof value !== "object") return { eq: value };
        return value
      })
      .optional(),
    query("sort_by")
      .isIn([
        "id",
        "firstname",
        "lastname",
        "updated_at",
        "deleted_at",
        "created_at",
      ]).customSanitizer(value => {
        return {eq: value}
      })
      .optional(),
    query("sort_order")
      .isIn(["asc", "desc"])
      .customSanitizer((value) => {
        return { eq: value };
      })
      .optional(),
    query("page_size")
      .custom((value) => {
        if (isNaN(value)) throw new Error("Page value must be a number");
        if (value <= 0) throw new Error("Page value must be greater than 0");
        return true;
      })
      .customSanitizer((value) => {
        return { eq: value };
      })
      .optional(),
    query("page")
      .custom((value) => {
        if (isNaN(value)) throw new Error("Page value must be a number");
        if (value <= 0) throw new Error("Page value must be greater than 0");
        return true;
      })
      .customSanitizer((value) => {
        return { eq: value };
      })
      .optional(),
  ],
};
