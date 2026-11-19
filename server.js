
const http = require("http");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || "";

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST" || req.url !== "/verify") {
    res.writeHead(404);
    return res.end(JSON.stringify({
      success: false,
      message: "NOT_FOUND"
    }));
  }

  let body = "";

  req.on("data", chunk => {
    body += chunk;
    if (body.length > 4096) req.destroy();
  });

  req.on("end", () => {
    try {
      const data = JSON.parse(body);
      const key = String(data.key || "");

      const valid =
        SECRET_KEY.length > 0 &&
        key.length === SECRET_KEY.length &&
        crypto.timingSafeEqual(
          Buffer.from(key),
          Buffer.from(SECRET_KEY)
        );

      res.writeHead(200);
      res.end(JSON.stringify({
        success: valid,
        message: valid ? "OK" : "INVALID_KEY"
      }));
    } catch {
      res.writeHead(400);
      res.end(JSON.stringify({
        success: false,
        message: "BAD_REQUEST"
      }));
    }
  });
});

server.listen(PORT, "0.0.0.0");
