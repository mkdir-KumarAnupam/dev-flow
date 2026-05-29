const localtunnel = require("localtunnel");

(async () => {
  console.log("Starting localtunnel...");
  try {
    const tunnel = await localtunnel({ port: 4000 });
    console.log("Tunnel started:", tunnel.url);
    tunnel.close();
  } catch(e) {
    console.error("Error:", e);
  }
})();
