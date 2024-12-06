import request from "supertest";
import dotenv from "dotenv"; // načtení konfiguace ze souboru config.json - zde je to ještě před prvním použitím,Node.js to sám neudělá
dotenv.config(); // vloží hodnoty ze souboru .env do process.env
import app from "../server.js";

const user_id = "673dd06dea25d3473b2acd69";

describe("GET /list/getAll", () => {
  it("should return all lists", async () => {
    return request(app)
      .get("/list/getAll")
      .set("user_id", user_id)
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.statusCode).toBe(200);
      });
  });
});

let listId = "673dcba2ea25d3473b2acd5f";
describe("GET /list/getList/:id", () => {
  it("should return one list", async () => {
    return request(app)
      .get(`/list/getList/${listId}`)
      .set("user_id", user_id)
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body._id).toEqual(listId);
        console.log(res.body);
      });
  });
});
