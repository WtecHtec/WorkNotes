import express from "express";
import cookieParser from "cookie-parser";
import { AUTH_PORT } from "../shared/config.js";
import { ensureDataFiles } from "../shared/json-store.js";
import { metadataRouter } from "./routes/metadata.js";
import { registerRouter } from "./routes/register.js";
import { authorizeRouter } from "./routes/authorize.js";
import { tokenRouter } from "./routes/token.js";

await ensureDataFiles();

const app = express();
app.disable("x-powered-by");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ ok: true, service: "auth-server" }));
app.use(metadataRouter);
app.use(registerRouter);
app.use(authorizeRouter);
app.use(tokenRouter);

app.listen(AUTH_PORT, "0.0.0.0", () => {
  console.log(`Auth Server listening on http://localhost:${AUTH_PORT}`);
});
