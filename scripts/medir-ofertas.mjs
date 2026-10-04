import { performance } from "node:perf_hooks";

const url = process.argv[2] || "http://localhost:3000/api/ofertas";
const mediciones = [];

for (let intento = 1; intento <= 10; intento += 1) {
  const inicio = performance.now();
  const respuesta = await fetch(url);
  const cuerpo = await respuesta.arrayBuffer();
  const tiempoMs = performance.now() - inicio;

  if (!respuesta.ok) {
    throw new Error(`GET ${url} devolvió ${respuesta.status}: ${Buffer.from(cuerpo).toString("utf8")}`);
  }

  const json = JSON.parse(Buffer.from(cuerpo).toString("utf8"));
  const items = Array.isArray(json.data) ? json.data : json.data?.data;
  mediciones.push({ tiempoMs, bytes: cuerpo.byteLength, items: items?.length ?? 0 });
  console.log(`Intento ${intento}: ${tiempoMs.toFixed(2)} ms, ${(cuerpo.byteLength / 1024).toFixed(2)} KB, ${items?.length ?? 0} ítems`);
}

const promedio = (campo) => mediciones.reduce((total, item) => total + item[campo], 0) / mediciones.length;
console.log("\nResumen (10 solicitudes)");
console.log(`URL: ${url}`);
console.log(`Tiempo promedio: ${promedio("tiempoMs").toFixed(2)} ms`);
console.log(`Tamaño promedio: ${(promedio("bytes") / 1024).toFixed(2)} KB`);
console.log(`Ítems devueltos: ${promedio("items").toFixed(0)}`);
