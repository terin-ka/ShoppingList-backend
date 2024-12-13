import request from "supertest";
import dotenv from "dotenv"; // načtení konfigurace ze souboru config.json
dotenv.config(); // vloží hodnoty ze souboru .env do process.env
import app from "../server.js";

const user_id = "673dd06dea25d3473b2acd69";
let listId;

describe("GET /list/getAll", () => {
  it("should return all lists", async () => {
    const res = await request(app)
      .get("/list/getAll")
      .set("user_id", user_id)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.statusCode).toBe(200);
  });

  it("should fail to get all lists with non-existing user_id", async () => {
    const nonExistingUserId = "000000000000000000000000";
    const res = await request(app)
      .get("/list/getAll")
      .set("user_id", nonExistingUserId)
      .expect(401); // Status code pro Unauthorized

    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("User not found");
  });
});

// Test na vytvoření seznamu
describe("POST /list/create", () => {
  it("should create a new list", async () => {
    const listData = { listName: "Nový nákupní list" };
    const res = await request(app)
      .post("/list/create")
      .set("user_id", user_id)
      .send(listData)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("listId");
    listId = res.body.listId; // Dynamické uložení ID
    expect(listId).toBeDefined(); // Ověření, že ID bylo vráceno
  });

  it("should fail to create list without listName", async () => {
    const res = await request(app)
      .post("/list/create")
      .set("user_id", user_id)
      .send({})
      .expect(400); // Status code pro chybný požadavek

    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("\"listName\" is required");
  });
});

// Test na získání jednoho seznamu
describe("GET /list/getList/:id", () => {
  it("should return one list", async () => {
    const res = await request(app)
      .get(`/list/getList/${listId}`)
      .set("user_id", user_id)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toEqual(listId);
  });

  it("should return 404 for non-existing list", async () => {
    const nonExistingId = "000000000000000000000000";
    const res = await request(app)
      .get(`/list/getList/${nonExistingId}`)
      .set("user_id", user_id)
      .expect(404);

    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("List not found");
  });
});

// Test na aktualizaci seznamu
describe("PATCH /list/update/:id", () => {
  it("should update a list", async () => {
    const updatedData = { name: "Aktualizovaný nákupní list" };
    const res = await request(app)
      .patch(`/list/update/${listId}`)
      .set("user_id", user_id)
      .send(updatedData)
      .expect("Content-Type", /json/)
      .expect(200);

      expect(res.body).toHaveProperty("listId");
      expect(res.body.listId).toEqual(listId);
      expect(res.body).toHaveProperty("newName");
      expect(res.body.newName).toEqual(updatedData.name);
  });

  it("should return 404 for non-existing list", async () => {
    const nonExistingId = "000000000000000000000000";
    const res = await request(app)
      .patch(`/list/update/${nonExistingId}`)
      .set("user_id", user_id)
      .send({ name: "Non-existent list" })
      .expect(404);

    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("List not found");
  });
});

// Test na odstranění seznamu
describe("DELETE /list/delete/:id", () => {
  it("should delete a list", async () => {
    const res = await request(app)
      .delete(`/list/delete/${listId}`)
      .set("user_id", user_id)
      .expect(200);

    expect(res.body).toHaveProperty("listId");
    expect(res.body.listId).toEqual(listId);
  });

  it("should return 404 for non-existing list", async () => {
    const nonExistingId = "000000000000000000000000";
    const res = await request(app)
      .delete(`/list/delete/${nonExistingId}`)
      .set("user_id", user_id)
      .expect(404);

    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("List not found");
  });
});
