/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const { createRequire } = require('node:module');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const tar = require('tar');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');

// Follow local static imports, re-exports, and lazy imports. Checking only the
// root file would miss missing card chunks or declaration dependencies.
function checkLocalModules(entry, packageDir, visited = new Set()) {
  const filename = path.resolve(entry);
  assert.ok(filename.startsWith(`${packageDir}${path.sep}`));
  assert.ok(fs.statSync(filename).isFile(), `Missing module: ${filename}`);
  if (visited.has(filename)) return visited;
  visited.add(filename);
  const source = ts.createSourceFile(
    filename,
    fs.readFileSync(filename, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  function visit(node) {
    let specifier;
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      specifier = node.moduleSpecifier;
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      specifier = node.arguments[0];
    }
    if (specifier && ts.isStringLiteral(specifier) && specifier.text.startsWith('.')) {
      const target = path.resolve(path.dirname(filename), specifier.text);
      const resolved = [target, `${target}.js`, `${target}.d.ts`, path.join(target, 'index.d.ts')]
        .find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      assert.ok(resolved, `Missing local import ${specifier.text} in ${filename}`);
      checkLocalModules(resolved, packageDir, visited);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return visited;
}

test('npm tarball exposes compiled JavaScript, declarations, and lazy card modules', async t => {
  const manifestPath = path.join(root, 'package.json');
  const backupPath = path.join(root, 'package.json-prepack');
  const originalManifest = fs.readFileSync(manifestPath, 'utf8');
  const originalLock = fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8');
  const sourcePackage = JSON.parse(originalManifest);
  const sourceLock = JSON.parse(originalLock);
  assert.equal(sourceLock.version, sourcePackage.version);
  assert.equal(sourceLock.packages[''].version, sourcePackage.version);
  assert.ok(!fs.existsSync(backupPath), 'Restore an interrupted pack before testing');
  assert.ok(process.env.npm_execpath, 'Run this test with npm run test:package');
  // Module resolvers canonicalize symlinks; do the same for the OS temp path.
  const temporary = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'kubeatlas-package-')),
  );
  let passed = false;
  t.after(() => {
    // Keep failed tarballs available for diagnosis; remove only this test's
    // successful, uniquely-created fixture directory.
    if (passed) fs.rmSync(temporary, { recursive: true, force: true });
    else t.diagnostic(`Packaging evidence retained at ${temporary}`);
  });

  let packed;
  try {
    packed = JSON.parse(execFileSync(process.execPath, [
      process.env.npm_execpath, 'pack', '--json', '--ignore-scripts=false',
      '--pack-destination', temporary,
    ], { cwd: root, encoding: 'utf8', timeout: 120_000 }))[0];
  } finally {
    assert.equal(fs.readFileSync(manifestPath, 'utf8'), originalManifest,
      'postpack must restore the source package.json');
    assert.equal(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'), originalLock,
      'packing must not change the lockfile');
    assert.ok(!fs.existsSync(backupPath), 'postpack must remove its backup');
  }

  assert.equal(packed.name, sourcePackage.name);
  assert.equal(packed.version, sourcePackage.version);
  assert.ok(!packed.files.some(file => file.path.startsWith('src/')),
    'The published entrypoint must not pull source files into the tarball');
  await tar.x({ file: path.join(temporary, packed.filename), cwd: temporary, strict: true });
  const consumer = path.join(temporary, 'consumer');
  const packageDir = path.join(consumer, 'node_modules', sourcePackage.name);
  fs.mkdirSync(path.dirname(packageDir), { recursive: true });
  fs.renameSync(path.join(temporary, 'package'), packageDir);
  const published = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
  assert.equal(published.name, sourcePackage.name);
  assert.equal(published.version, sourcePackage.version);
  assert.equal(published.main, 'dist/index.esm.js');
  assert.equal(published.types, 'dist/index.d.ts');
  assert.equal(published.backstage.pluginId, 'kubeatlas');
  assert.deepEqual(published.backstage.pluginPackages, [sourcePackage.name]);
  assert.deepEqual(published.peerDependencies, sourcePackage.peerDependencies);

  const consumerFile = path.join(consumer, 'index.ts');
  const consumerRequire = createRequire(consumerFile);
  assert.equal(consumerRequire.resolve(sourcePackage.name), path.join(packageDir, published.main));
  const resolvedTypes = ts.resolveModuleName(sourcePackage.name, consumerFile,
    { moduleResolution: ts.ModuleResolutionKind.NodeJs }, ts.sys).resolvedModule;
  assert.ok(resolvedTypes, 'The consumer must resolve the published declarations');
  assert.equal(fs.realpathSync(resolvedTypes.resolvedFileName),
    fs.realpathSync(path.join(packageDir, published.types)));

  const modules = checkLocalModules(path.join(packageDir, published.main), packageDir);
  checkLocalModules(path.join(packageDir, published.types), packageDir);
  for (const card of ['EntityKubeAtlasContent', 'DependencyGraphCard', 'BlastRadiusCard', 'PolicyCard', 'OTelOverlayCard']) {
    assert.ok(modules.has(path.join(packageDir, 'dist', 'components', `${card}.esm.js`)),
      `The published import graph must include ${card}`);
  }

  // Prove this gate detects a broken lazy import, not just valid metadata.
  fs.unlinkSync(path.join(packageDir, 'dist', 'components', 'BlastRadiusCard.esm.js'));
  assert.throws(() => checkLocalModules(path.join(packageDir, published.main), packageDir),
    /Missing local import/);
  passed = true;
});
