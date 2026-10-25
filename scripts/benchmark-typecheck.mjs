import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const projects = ["."];
const compilers = {
  ts6: "node_modules/typescript/bin/tsc",
  ts7: "node_modules/@typescript/native/bin/tsc",
};
const versions = {};
const samples = Object.fromEntries(
  projects.map((project) => [project, { ts6: [], ts7: [] }]),
);
for (const project of projects) {
  versions[project] = {};
  for (const [name, path] of Object.entries(compilers)) {
    const result = spawnSync(
      process.execPath,
      [resolve(project, path), "--version"],
      {
        encoding: "utf8",
      },
    );
    if (
      result.status !== 0 ||
      !result.stdout.startsWith(`Version ${name.slice(2)}.`)
    )
      throw new Error(
        `${project} ${name}: unexpected compiler ${result.stdout} ${result.stderr}`,
      );
    versions[project][name] = result.stdout.trim();
  }
}
for (let round = 0; round < 6; round++) {
  for (const project of projects) {
    for (const compiler of round % 2 ? ["ts7", "ts6"] : ["ts6", "ts7"]) {
      const before = performance.now();
      const result = spawnSync(
        process.execPath,
        [
          resolve(project, compilers[compiler]),
          "-p",
          "tsconfig.json",
          "--noEmit",
          "--incremental",
          "false",
        ],
        { cwd: resolve(project), encoding: "utf8" },
      );
      const milliseconds = performance.now() - before;
      if (result.status !== 0)
        throw new Error(
          `${project} ${compiler}: ${result.stdout} ${result.stderr}`,
        );
      if (round > 0) samples[project][compiler].push(milliseconds);
    }
  }
}
const median = (values) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const summary = Object.fromEntries(
  Object.entries(samples).map(([project, values]) => [
    project,
    {
      ts6Ms: median(values.ts6),
      ts7Ms: median(values.ts7),
      speedup: median(values.ts6) / median(values.ts7),
    },
  ]),
);
console.log(
  JSON.stringify(
    {
      measuredAt: new Date().toISOString(),
      node: process.version,
      versions,
      warmupRounds: 1,
      rounds: 5,
      mode: "Identical sources and dependencies; no emit; incremental disabled; alternating order; local shared development host",
      samples,
      summary,
    },
    null,
    2,
  ),
);
