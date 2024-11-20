import Joi from "joi";

// Obecná funkce pro validaci dat
const validateData = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};

// Validační schéma pro vytvoření seznamu
const createListSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  isArchived: Joi.boolean().default(false),
});

// Validační schéma pro aktualizaci seznamu
const updateListSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
});

// Export middleware pro validaci
export const validateCreateList = validateData(createListSchema);
export const validateUpdateList = validateData(updateListSchema);