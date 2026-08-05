import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./server";

describe("server endpoints", () => {
  it("returns hello world page on /", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.type).toContain("html");
    expect(response.text).toContain("Hello World");
  });

  it("returns health payload on /health", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.type).toContain("json");
    expect(response.body.status).toBe("UP");
    expect(typeof response.body.time).toBe("string");
    expect(Number.isNaN(Date.parse(response.body.time))).toBe(false);
  });
});
