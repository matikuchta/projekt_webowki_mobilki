import "dotenv/config";
import express from "express";
import cors from "cors";
import { login } from "./Login.ts";
import { register } from "./Register.ts";
import { callVolleyballApi } from "./volleyballApi.ts";

const app = express();
const port = Number(process.env.PORT) || 3001;

function getErrorStatus(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
    ? error.status
    : 500;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getErrorDetails(error: unknown) {
  return typeof error === "object" && error !== null && "details" in error
    ? error.details
    : undefined;
}

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/volleyball/status", async (_req, res) => {
  try {
    const data = await callVolleyballApi("/status");
    return res.json(data);
  } catch (error) {
    console.error(error);

    return res.status(getErrorStatus(error)).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch Volleyball API status"),
      details: getErrorDetails(error),
    });
  }
});

app.get("/api/volleyball/leagues", async (req, res) => {
  try {
    const { country, season, search, code, id } = req.query;

    const data = await callVolleyballApi("/leagues", {
      country: typeof country === "string" ? country : undefined,
      season: typeof season === "string" ? season : undefined,
      search: typeof search === "string" ? search : undefined,
      code: typeof code === "string" ? code : undefined,
      id: typeof id === "string" ? id : undefined,
    });

    return res.json(data);
  } catch (error) {
    console.error(error);

    return res.status(getErrorStatus(error)).json({
      success: false,
      message: getErrorMessage(error, "Failed to fetch Volleyball API leagues"),
      details: getErrorDetails(error),
    });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, password } = req.body;
    const result = await register(name, password);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    const result = await login(name, password);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
