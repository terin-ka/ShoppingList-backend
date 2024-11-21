import Joi from "joi";

//VYřEšIT DEFAULT

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

// Validační schéma pro přidání membera
const addMemberSchema = Joi.object({
  memberId: Joi.string().required(),
});

// Validační schéma pro odstranění membera
const deleteMemberSchema = Joi.object({
  memberId: Joi.string().required(),
});

// Validační schéma pro vytvoření itemu
const createItemSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  count: Joi.number().default(1),
  resolved: Joi.boolean().default(false),
});

// Validační schéma pro odstranění membera
const deleteItemSchema = Joi.object({
  itemId: Joi.string().required(),
});



export const validateCreateList = validateData(createListSchema);
export const validateUpdateList = validateData(updateListSchema);
export const validateAddMember = validateData(addMemberSchema);
export const validateDeleteMember = validateData(deleteMemberSchema);
export const validateCreateItem = validateData(createItemSchema);
export const validateDeleteItem = validateData(deleteItemSchema);
