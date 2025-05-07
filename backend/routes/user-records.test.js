import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import userRouter from "./user-records.js";
import User from "../database/user.js";
import Expense from "../database/expense.js";

vi.mock("../database/user.js");
vi.mock("../database/expense.js");
vi.mock("jsonwebtoken");
vi.mock("bcryptjs");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api", userRouter);

describe("User API routes", () => {
  const testUserId = "64a1f823facad5d0f4d16d44";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  
  it("fails register with invalid email", async () => {
    const res = await request(app).post("/api/register").send({
      username: "testuser",
      email: "invalid-email",
      password: "password123"
    });

    expect(res.statusCode).toBe(400);
  });

  it("logs in an existing user", async () => {
    const mockUser = {
      _id: testUserId,
      password: "hashed"
    };
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("testtoken");

    const res = await request(app).post("/api/login").send({
      email: "test@example.com",
      password: "password123"
    });

    expect(res.statusCode).toBe(200);
  });

  it("fails login with invalid credentials", async () => {
    User.findOne.mockResolvedValue(null);
    const res = await request(app).post("/api/login").send({
      email: "notfound@example.com",
      password: "wrongpass"
    });

    expect(res.statusCode).toBe(400);
  });

  
});
