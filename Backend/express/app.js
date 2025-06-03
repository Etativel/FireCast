const express = require("express");
const app = express();
// const passport = require("passport");
// require("./services/passportConfig");

const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const { createProxyMiddleware } = require("http-proxy-middleware");

app.use(
  cors({
    origin: ["http://localhost:5174", "http://localhost:5173"],
    allowedHeaders: "Content-Type",
    methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
// app.use(cookieParser());
// app.use(passport.initialize());

// PROXY: /model to Flask service
// app.use(
//   "/model",
//   createProxyMiddleware({
//     target: "https://foodlens-model-production.up.railway.app",
//     changeOrigin: true,
//     pathRewrite: { "^/model": "" },
//     onProxyReq(proxyReq, req) {
//       // forward cookies so Flask sees the JWT
//       if (req.headers.cookie) {
//         proxyReq.setHeader("Cookie", req.headers.cookie);
//       }
//     },
//   })
// );
const weatherRouter = require("./router/WeatherRouter");

app.use("/weather", weatherRouter);

app.get("/", (req, res) => {
  res.status(200).send({ status: "ok" });
});

const PORT = 3000;

app.listen(PORT, () => console.log("app running on port ", PORT));
