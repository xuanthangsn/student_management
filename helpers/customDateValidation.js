const customDateValidation = (value) => {
  if (typeof value === "string") return checkDate(value);
  if (typeof value === "object") {
    let ltCount = 0;
    let gtCount = 0;
    Object.keys(value).forEach((op) => {
      if (op !== "lt" && op !== "lte" && op !== "gt" && op !== "gte")
        throw new Error("Invalid operator");
      if (op === "lt" || op === "lte") {
        ltCount++;
        if (ltCount > 1)
          throw new Error("There are more than 1 'less than' operator");
      }
      if (op === "gt" || op === "gte") {
        gtCount++;
        if (gtCount > 1)
          throw new Error("There are more than 1 'greater than' operator");
      }
      checkDate(value[op]);
    });
    return true;
  }
  return false;
};

const checkDate = (str) => {
  if (typeof str !== "string") {
    throw new TypeError("str needs to be a string");
  }
  const regex = /^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})$/;

  if (!str.match(regex) || isNaN(new Date(str).getTime())) {
    throw new Error("Invalid date value");
  }
  return true;
};

module.exports = customDateValidation;