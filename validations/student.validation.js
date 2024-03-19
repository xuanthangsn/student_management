const { body, query } = require("express-validator");
const customDateValidation = require("../helpers/customDateValidation");
module.exports = {
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
    query("address")
      .isString()
      .customSanitizer((value) => {
        return { like: value };
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
        return value;
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
      ])
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
  update: [
    body("firstname").isString().optional(),
    body("lastname").isString().optional(),
    body("phone_number").isString().optional(),
    body("gender").isIn(["male", "female"]).optional(),
    body("address").isString().optional(),
  ],
  bulkUpdate: [
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
    query("firstname")
      .isString()
      .customSanitizer((value) => {
        return { eq: value };
      })
      .optional(),
    query("lastname")
      .isString()
      .customSanitizer((value) => {
        return { eq: value };
      })
      .optional(),
    query("phone_number")
      .isString()
      .customSanitizer((value) => {
        return { eq: value };
      })
      .optional(),
    query("gender")
      .isIn(["male", "female"])
      .customSanitizer((value) => {
        return { eq: value };
      })
      .optional(),
    query("address")
      .isString()
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
        return value;
      })
      .optional(),
    body("firstname").isString().optional(),
    body("lastname").isString().optional(),
    body("phone_number").isString().optional(),
    body("gender").isIn(["male", "female"]).optional(),
    body("address").isString().optional(),
  ],
  create: [
    // This middleware uniformize the request body data
    (req, res, next) => {
      if (!Array.isArray(req.body)) {
        req.body = [req.body];
      }
      return next();
    },
    body("*.firstname").exists().isString(),
    body("*.lastname").exists().isString(),
    body("*.phone_number").isString().optional(),
    body("*.gender").exists().isIn(["male", "female"]),
    body("*.address").isString().optional(),
  ],
  bulkDelete: [
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
    query("firstname")
      .isString()
      .customSanitizer((value) => {
        return { eq: value };
      })
      .optional(),
    query("lastname")
      .isString()
      .customSanitizer((value) => {
        return { eq: value };
      })
      .optional(),
    query("phone_number")
      .isString()
      .customSanitizer((value) => {
        return { eq: value };
      })
      .optional(),
    query("gender")
      .isIn(["male", "female"])
      .customSanitizer((value) => {
        return { eq: value };
      })
      .optional(),
    query("address")
      .isString()
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
        return value;
      })
      .optional(),
  ],
};
