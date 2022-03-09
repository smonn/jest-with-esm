import express, { Express } from "express";
import got from "got";
import http from "node:http";
import net from "node:net";

function destroyServer(server: http.Server) {
  return new Promise<void>((resolve, reject) => {
    server.close((err?: Error) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function createServer() {
  return new Promise<{
    server: http.Server;
    app: Express;
    port: number;
    url: string;
    hostname: string;
  }>((resolve, reject) => {
    const app = express();
    const server = http.createServer(app);

    server.listen((err?: Error) => {
      if (err) reject(err);
      else {
        const hostname = "localhost";
        const port = (server.address() as net.AddressInfo).port;
        const url = `http://${hostname}:${port}`;
        resolve({ app, server, port, url, hostname });
      }
    });
  });
}

test("GET /", async () => {
  const { app, server, url } = await createServer();
  const payload = { message: "hello world" };

  app.get("/", (_, res) => {
    res.json(payload);
  });

  const response = await got.get<typeof payload>(url, { responseType: "json" });
  expect(response.statusCode).toBe(200);
  expect(response.headers["content-type"]).toContain("application/json");
  expect(response.body).toEqual(payload);

  await destroyServer(server);
});
