// block-engine.mjs: the Block engine (Finnomena's Pattern builder) for Node: Patterns, composed Pages, the text
// shaper and an SVG rasteriser. Built from Block (github.com/pawisssh/block) commit 51830c6daeb8a3512f81c72f244879c78e486c76
// by `npm run build:engine-bundle`. Do not edit: change Block and build again.
//
// Code: MIT License, Copyright (c) 2026 Pawish Gawinseth (Block's LICENSE). It bundles harfbuzzjs (MIT License,
// Copyright (c) 2019 Ebrahim Byagowi), whose hb.wasm sits beside this file.
// The Reference Pattern data and the Finnomena logo embedded below, and the artwork this draws, are Finnomena brand
// assets: all rights reserved, used under the Finnomena brand guideline (Block's NOTICE). Not covered by MIT.
import { createRequire as __blockCreateRequire } from 'node:module';
import { dirname as __blockDirname } from 'node:path';
import { fileURLToPath as __blockFileURLToPath } from 'node:url';
const require = __blockCreateRequire(import.meta.url);
const __dirname = __blockDirname(__blockFileURLToPath(import.meta.url));
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/harfbuzzjs/hb.js
var require_hb = __commonJS({
  "node_modules/harfbuzzjs/hb.js"(exports, module) {
    var createHarfBuzz2 = (() => {
      var _scriptName = typeof document != "undefined" ? document.currentScript?.src : void 0;
      return async function(moduleArg = {}) {
        var moduleRtn;
        var Module = moduleArg;
        var ENVIRONMENT_IS_WEB = typeof window == "object";
        var ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != "undefined";
        var ENVIRONMENT_IS_NODE = typeof process == "object" && process.versions?.node && process.type != "renderer";
        var arguments_ = [];
        var thisProgram = "./this.program";
        var quit_ = (status, toThrow) => {
          throw toThrow;
        };
        if (typeof __filename != "undefined") {
          _scriptName = __filename;
        } else if (ENVIRONMENT_IS_WORKER) {
          _scriptName = self.location.href;
        }
        var scriptDirectory = "";
        function locateFile(path) {
          if (Module["locateFile"]) {
            return Module["locateFile"](path, scriptDirectory);
          }
          return scriptDirectory + path;
        }
        var readAsync, readBinary;
        if (ENVIRONMENT_IS_NODE) {
          var fs = __require("fs");
          scriptDirectory = __dirname + "/";
          readBinary = (filename) => {
            filename = isFileURI(filename) ? new URL(filename) : filename;
            var ret = fs.readFileSync(filename);
            return ret;
          };
          readAsync = async (filename, binary = true) => {
            filename = isFileURI(filename) ? new URL(filename) : filename;
            var ret = fs.readFileSync(filename, binary ? void 0 : "utf8");
            return ret;
          };
          if (process.argv.length > 1) {
            thisProgram = process.argv[1].replace(/\\/g, "/");
          }
          arguments_ = process.argv.slice(2);
          quit_ = (status, toThrow) => {
            process.exitCode = status;
            throw toThrow;
          };
        } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
          try {
            scriptDirectory = new URL(".", _scriptName).href;
          } catch {
          }
          {
            if (ENVIRONMENT_IS_WORKER) {
              readBinary = (url) => {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, false);
                xhr.responseType = "arraybuffer";
                xhr.send(null);
                return new Uint8Array(xhr.response);
              };
            }
            readAsync = async (url) => {
              if (isFileURI(url)) {
                return new Promise((resolve, reject) => {
                  var xhr = new XMLHttpRequest();
                  xhr.open("GET", url, true);
                  xhr.responseType = "arraybuffer";
                  xhr.onload = () => {
                    if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                      resolve(xhr.response);
                      return;
                    }
                    reject(xhr.status);
                  };
                  xhr.onerror = reject;
                  xhr.send(null);
                });
              }
              var response = await fetch(url, { credentials: "same-origin" });
              if (response.ok) {
                return response.arrayBuffer();
              }
              throw new Error(response.status + " : " + response.url);
            };
          }
        } else {
        }
        var out = console.log.bind(console);
        var err = console.error.bind(console);
        var wasmBinary;
        var ABORT = false;
        var EXITSTATUS;
        var isFileURI = (filename) => filename.startsWith("file://");
        var readyPromiseResolve, readyPromiseReject;
        var wasmMemory;
        var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
        var HEAP64, HEAPU64;
        var runtimeInitialized = false;
        function updateMemoryViews() {
          var b = wasmMemory.buffer;
          Module["HEAP8"] = HEAP8 = new Int8Array(b);
          HEAP16 = new Int16Array(b);
          Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
          HEAPU16 = new Uint16Array(b);
          Module["HEAP32"] = HEAP32 = new Int32Array(b);
          Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
          Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
          HEAPF64 = new Float64Array(b);
          HEAP64 = new BigInt64Array(b);
          HEAPU64 = new BigUint64Array(b);
        }
        function preRun() {
          if (Module["preRun"]) {
            if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
            while (Module["preRun"].length) {
              addOnPreRun(Module["preRun"].shift());
            }
          }
          callRuntimeCallbacks(onPreRuns);
        }
        function initRuntime() {
          runtimeInitialized = true;
          wasmExports["__wasm_call_ctors"]();
        }
        function postRun() {
          if (Module["postRun"]) {
            if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
            while (Module["postRun"].length) {
              addOnPostRun(Module["postRun"].shift());
            }
          }
          callRuntimeCallbacks(onPostRuns);
        }
        var runDependencies = 0;
        var dependenciesFulfilled = null;
        function addRunDependency(id) {
          runDependencies++;
          Module["monitorRunDependencies"]?.(runDependencies);
        }
        function removeRunDependency(id) {
          runDependencies--;
          Module["monitorRunDependencies"]?.(runDependencies);
          if (runDependencies == 0) {
            if (dependenciesFulfilled) {
              var callback = dependenciesFulfilled;
              dependenciesFulfilled = null;
              callback();
            }
          }
        }
        function abort(what) {
          Module["onAbort"]?.(what);
          what = "Aborted(" + what + ")";
          err(what);
          ABORT = true;
          what += ". Build with -sASSERTIONS for more info.";
          var e = new WebAssembly.RuntimeError(what);
          readyPromiseReject?.(e);
          throw e;
        }
        var wasmBinaryFile;
        function findWasmBinary() {
          return locateFile("hb.wasm");
        }
        function getBinarySync(file) {
          if (file == wasmBinaryFile && wasmBinary) {
            return new Uint8Array(wasmBinary);
          }
          if (readBinary) {
            return readBinary(file);
          }
          throw "both async and sync fetching of the wasm failed";
        }
        async function getWasmBinary(binaryFile) {
          if (!wasmBinary) {
            try {
              var response = await readAsync(binaryFile);
              return new Uint8Array(response);
            } catch {
            }
          }
          return getBinarySync(binaryFile);
        }
        async function instantiateArrayBuffer(binaryFile, imports) {
          try {
            var binary = await getWasmBinary(binaryFile);
            var instance = await WebAssembly.instantiate(binary, imports);
            return instance;
          } catch (reason) {
            err(`failed to asynchronously prepare wasm: ${reason}`);
            abort(reason);
          }
        }
        async function instantiateAsync(binary, binaryFile, imports) {
          if (!binary && !isFileURI(binaryFile) && !ENVIRONMENT_IS_NODE) {
            try {
              var response = fetch(binaryFile, { credentials: "same-origin" });
              var instantiationResult = await WebAssembly.instantiateStreaming(response, imports);
              return instantiationResult;
            } catch (reason) {
              err(`wasm streaming compile failed: ${reason}`);
              err("falling back to ArrayBuffer instantiation");
            }
          }
          return instantiateArrayBuffer(binaryFile, imports);
        }
        function getWasmImports() {
          return { env: wasmImports, wasi_snapshot_preview1: wasmImports };
        }
        async function createWasm() {
          function receiveInstance(instance, module2) {
            wasmExports = instance.exports;
            Module["wasmExports"] = wasmExports;
            wasmMemory = wasmExports["memory"];
            Module["wasmMemory"] = wasmMemory;
            updateMemoryViews();
            wasmTable = wasmExports["__indirect_function_table"];
            assignWasmExports(wasmExports);
            removeRunDependency("wasm-instantiate");
            return wasmExports;
          }
          addRunDependency("wasm-instantiate");
          function receiveInstantiationResult(result2) {
            return receiveInstance(result2["instance"]);
          }
          var info = getWasmImports();
          if (Module["instantiateWasm"]) {
            return new Promise((resolve, reject) => {
              Module["instantiateWasm"](info, (mod, inst) => {
                resolve(receiveInstance(mod, inst));
              });
            });
          }
          wasmBinaryFile ??= findWasmBinary();
          var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info);
          var exports2 = receiveInstantiationResult(result);
          return exports2;
        }
        class ExitStatus {
          name = "ExitStatus";
          constructor(status) {
            this.message = `Program terminated with exit(${status})`;
            this.status = status;
          }
        }
        var callRuntimeCallbacks = (callbacks) => {
          while (callbacks.length > 0) {
            callbacks.shift()(Module);
          }
        };
        var onPostRuns = [];
        var addOnPostRun = (cb) => onPostRuns.push(cb);
        var onPreRuns = [];
        var addOnPreRun = (cb) => onPreRuns.push(cb);
        var noExitRuntime = true;
        var __abort_js = () => abort("");
        var runtimeKeepaliveCounter = 0;
        var __emscripten_runtime_keepalive_clear = () => {
          noExitRuntime = false;
          runtimeKeepaliveCounter = 0;
        };
        var timers = {};
        var handleException = (e) => {
          if (e instanceof ExitStatus || e == "unwind") {
            return EXITSTATUS;
          }
          quit_(1, e);
        };
        var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
        var _proc_exit = (code) => {
          EXITSTATUS = code;
          if (!keepRuntimeAlive()) {
            Module["onExit"]?.(code);
            ABORT = true;
          }
          quit_(code, new ExitStatus(code));
        };
        var exitJS = (status, implicit) => {
          EXITSTATUS = status;
          _proc_exit(status);
        };
        var _exit = exitJS;
        var maybeExit = () => {
          if (!keepRuntimeAlive()) {
            try {
              _exit(EXITSTATUS);
            } catch (e) {
              handleException(e);
            }
          }
        };
        var callUserCallback = (func) => {
          if (ABORT) {
            return;
          }
          try {
            func();
            maybeExit();
          } catch (e) {
            handleException(e);
          }
        };
        var _emscripten_get_now = () => performance.now();
        var __setitimer_js = (which, timeout_ms) => {
          if (timers[which]) {
            clearTimeout(timers[which].id);
            delete timers[which];
          }
          if (!timeout_ms) return 0;
          var id = setTimeout(() => {
            delete timers[which];
            callUserCallback(() => __emscripten_timeout(which, _emscripten_get_now()));
          }, timeout_ms);
          timers[which] = { id, timeout_ms };
          return 0;
        };
        var getHeapMax = () => 2147483648;
        var alignMemory = (size, alignment) => Math.ceil(size / alignment) * alignment;
        var growMemory = (size) => {
          var oldHeapSize = wasmMemory.buffer.byteLength;
          var pages = (size - oldHeapSize + 65535) / 65536 | 0;
          try {
            wasmMemory.grow(pages);
            updateMemoryViews();
            return 1;
          } catch (e) {
          }
        };
        var _emscripten_resize_heap = (requestedSize) => {
          var oldSize = HEAPU8.length;
          requestedSize >>>= 0;
          var maxHeapSize = getHeapMax();
          if (requestedSize > maxHeapSize) {
            return false;
          }
          for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
            var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
            overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
            var newSize = Math.min(maxHeapSize, alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536));
            var replacement = growMemory(newSize);
            if (replacement) {
              return true;
            }
          }
          return false;
        };
        var uleb128EncodeWithLen = (arr) => {
          const n = arr.length;
          return [n % 128 | 128, n >> 7, ...arr];
        };
        var wasmTypeCodes = { i: 127, p: 127, j: 126, f: 125, d: 124, e: 111 };
        var generateTypePack = (types) => uleb128EncodeWithLen(Array.from(types, (type) => {
          var code = wasmTypeCodes[type];
          return code;
        }));
        var convertJsFunctionToWasm = (func, sig) => {
          var bytes = Uint8Array.of(0, 97, 115, 109, 1, 0, 0, 0, 1, ...uleb128EncodeWithLen([1, 96, ...generateTypePack(sig.slice(1)), ...generateTypePack(sig[0] === "v" ? "" : sig[0])]), 2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);
          var module2 = new WebAssembly.Module(bytes);
          var instance = new WebAssembly.Instance(module2, { e: { f: func } });
          var wrappedFunc = instance.exports["f"];
          return wrappedFunc;
        };
        var wasmTable;
        var getWasmTableEntry = (funcPtr) => wasmTable.get(funcPtr);
        var updateTableMap = (offset, count) => {
          if (functionsInTableMap) {
            for (var i = offset; i < offset + count; i++) {
              var item = getWasmTableEntry(i);
              if (item) {
                functionsInTableMap.set(item, i);
              }
            }
          }
        };
        var functionsInTableMap;
        var getFunctionAddress = (func) => {
          if (!functionsInTableMap) {
            functionsInTableMap = /* @__PURE__ */ new WeakMap();
            updateTableMap(0, wasmTable.length);
          }
          return functionsInTableMap.get(func) || 0;
        };
        var freeTableIndexes = [];
        var getEmptyTableSlot = () => {
          if (freeTableIndexes.length) {
            return freeTableIndexes.pop();
          }
          return wasmTable["grow"](1);
        };
        var setWasmTableEntry = (idx, func) => wasmTable.set(idx, func);
        var addFunction = (func, sig) => {
          var rtn = getFunctionAddress(func);
          if (rtn) {
            return rtn;
          }
          var ret = getEmptyTableSlot();
          try {
            setWasmTableEntry(ret, func);
          } catch (err2) {
            if (!(err2 instanceof TypeError)) {
              throw err2;
            }
            var wrapped = convertJsFunctionToWasm(func, sig);
            setWasmTableEntry(ret, wrapped);
          }
          functionsInTableMap.set(func, ret);
          return ret;
        };
        var removeFunction = (index) => {
          functionsInTableMap.delete(getWasmTableEntry(index));
          setWasmTableEntry(index, null);
          freeTableIndexes.push(index);
        };
        {
          if (Module["noExitRuntime"]) noExitRuntime = Module["noExitRuntime"];
          if (Module["print"]) out = Module["print"];
          if (Module["printErr"]) err = Module["printErr"];
          if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
          if (Module["arguments"]) arguments_ = Module["arguments"];
          if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
        }
        Module["wasmMemory"] = wasmMemory;
        Module["wasmExports"] = wasmExports;
        Module["addFunction"] = addFunction;
        Module["removeFunction"] = removeFunction;
        var _hb_blob_create, _hb_blob_destroy, _hb_blob_get_length, _hb_blob_get_data, _hb_buffer_serialize_glyphs, _hb_buffer_create, _hb_buffer_destroy, _hb_buffer_get_content_type, _hb_buffer_set_direction, _hb_buffer_set_script, _hb_buffer_set_language, _hb_buffer_set_flags, _hb_buffer_set_cluster_level, _hb_buffer_get_length, _hb_buffer_get_glyph_infos, _hb_buffer_get_glyph_positions, _hb_glyph_info_get_glyph_flags, _hb_buffer_guess_segment_properties, _hb_buffer_add_utf8, _hb_buffer_add_utf16, _hb_buffer_set_message_func, _hb_language_from_string, _hb_script_from_string, _hb_version, _hb_version_string, _hb_feature_from_string, _malloc, _free, _hb_draw_funcs_set_move_to_func, _hb_draw_funcs_set_line_to_func, _hb_draw_funcs_set_quadratic_to_func, _hb_draw_funcs_set_cubic_to_func, _hb_draw_funcs_set_close_path_func, _hb_draw_funcs_create, _hb_draw_funcs_destroy, _hb_face_create, _hb_face_destroy, _hb_face_reference_table, _hb_face_get_upem, _hb_face_collect_unicodes, _hb_font_draw_glyph, _hb_font_glyph_to_string, _hb_font_create, _hb_font_set_variations, _hb_font_destroy, _hb_font_set_scale, _hb_set_create, _hb_set_destroy, _hb_ot_var_get_axis_infos, _hb_set_get_population, _hb_set_next_many, _hb_shape, __emscripten_timeout;
        function assignWasmExports(wasmExports2) {
          Module["_hb_blob_create"] = _hb_blob_create = wasmExports2["hb_blob_create"];
          Module["_hb_blob_destroy"] = _hb_blob_destroy = wasmExports2["hb_blob_destroy"];
          Module["_hb_blob_get_length"] = _hb_blob_get_length = wasmExports2["hb_blob_get_length"];
          Module["_hb_blob_get_data"] = _hb_blob_get_data = wasmExports2["hb_blob_get_data"];
          Module["_hb_buffer_serialize_glyphs"] = _hb_buffer_serialize_glyphs = wasmExports2["hb_buffer_serialize_glyphs"];
          Module["_hb_buffer_create"] = _hb_buffer_create = wasmExports2["hb_buffer_create"];
          Module["_hb_buffer_destroy"] = _hb_buffer_destroy = wasmExports2["hb_buffer_destroy"];
          Module["_hb_buffer_get_content_type"] = _hb_buffer_get_content_type = wasmExports2["hb_buffer_get_content_type"];
          Module["_hb_buffer_set_direction"] = _hb_buffer_set_direction = wasmExports2["hb_buffer_set_direction"];
          Module["_hb_buffer_set_script"] = _hb_buffer_set_script = wasmExports2["hb_buffer_set_script"];
          Module["_hb_buffer_set_language"] = _hb_buffer_set_language = wasmExports2["hb_buffer_set_language"];
          Module["_hb_buffer_set_flags"] = _hb_buffer_set_flags = wasmExports2["hb_buffer_set_flags"];
          Module["_hb_buffer_set_cluster_level"] = _hb_buffer_set_cluster_level = wasmExports2["hb_buffer_set_cluster_level"];
          Module["_hb_buffer_get_length"] = _hb_buffer_get_length = wasmExports2["hb_buffer_get_length"];
          Module["_hb_buffer_get_glyph_infos"] = _hb_buffer_get_glyph_infos = wasmExports2["hb_buffer_get_glyph_infos"];
          Module["_hb_buffer_get_glyph_positions"] = _hb_buffer_get_glyph_positions = wasmExports2["hb_buffer_get_glyph_positions"];
          Module["_hb_glyph_info_get_glyph_flags"] = _hb_glyph_info_get_glyph_flags = wasmExports2["hb_glyph_info_get_glyph_flags"];
          Module["_hb_buffer_guess_segment_properties"] = _hb_buffer_guess_segment_properties = wasmExports2["hb_buffer_guess_segment_properties"];
          Module["_hb_buffer_add_utf8"] = _hb_buffer_add_utf8 = wasmExports2["hb_buffer_add_utf8"];
          Module["_hb_buffer_add_utf16"] = _hb_buffer_add_utf16 = wasmExports2["hb_buffer_add_utf16"];
          Module["_hb_buffer_set_message_func"] = _hb_buffer_set_message_func = wasmExports2["hb_buffer_set_message_func"];
          Module["_hb_language_from_string"] = _hb_language_from_string = wasmExports2["hb_language_from_string"];
          Module["_hb_script_from_string"] = _hb_script_from_string = wasmExports2["hb_script_from_string"];
          Module["_hb_version"] = _hb_version = wasmExports2["hb_version"];
          Module["_hb_version_string"] = _hb_version_string = wasmExports2["hb_version_string"];
          Module["_hb_feature_from_string"] = _hb_feature_from_string = wasmExports2["hb_feature_from_string"];
          Module["_malloc"] = _malloc = wasmExports2["malloc"];
          Module["_free"] = _free = wasmExports2["free"];
          Module["_hb_draw_funcs_set_move_to_func"] = _hb_draw_funcs_set_move_to_func = wasmExports2["hb_draw_funcs_set_move_to_func"];
          Module["_hb_draw_funcs_set_line_to_func"] = _hb_draw_funcs_set_line_to_func = wasmExports2["hb_draw_funcs_set_line_to_func"];
          Module["_hb_draw_funcs_set_quadratic_to_func"] = _hb_draw_funcs_set_quadratic_to_func = wasmExports2["hb_draw_funcs_set_quadratic_to_func"];
          Module["_hb_draw_funcs_set_cubic_to_func"] = _hb_draw_funcs_set_cubic_to_func = wasmExports2["hb_draw_funcs_set_cubic_to_func"];
          Module["_hb_draw_funcs_set_close_path_func"] = _hb_draw_funcs_set_close_path_func = wasmExports2["hb_draw_funcs_set_close_path_func"];
          Module["_hb_draw_funcs_create"] = _hb_draw_funcs_create = wasmExports2["hb_draw_funcs_create"];
          Module["_hb_draw_funcs_destroy"] = _hb_draw_funcs_destroy = wasmExports2["hb_draw_funcs_destroy"];
          Module["_hb_face_create"] = _hb_face_create = wasmExports2["hb_face_create"];
          Module["_hb_face_destroy"] = _hb_face_destroy = wasmExports2["hb_face_destroy"];
          Module["_hb_face_reference_table"] = _hb_face_reference_table = wasmExports2["hb_face_reference_table"];
          Module["_hb_face_get_upem"] = _hb_face_get_upem = wasmExports2["hb_face_get_upem"];
          Module["_hb_face_collect_unicodes"] = _hb_face_collect_unicodes = wasmExports2["hb_face_collect_unicodes"];
          Module["_hb_font_draw_glyph"] = _hb_font_draw_glyph = wasmExports2["hb_font_draw_glyph"];
          Module["_hb_font_glyph_to_string"] = _hb_font_glyph_to_string = wasmExports2["hb_font_glyph_to_string"];
          Module["_hb_font_create"] = _hb_font_create = wasmExports2["hb_font_create"];
          Module["_hb_font_set_variations"] = _hb_font_set_variations = wasmExports2["hb_font_set_variations"];
          Module["_hb_font_destroy"] = _hb_font_destroy = wasmExports2["hb_font_destroy"];
          Module["_hb_font_set_scale"] = _hb_font_set_scale = wasmExports2["hb_font_set_scale"];
          Module["_hb_set_create"] = _hb_set_create = wasmExports2["hb_set_create"];
          Module["_hb_set_destroy"] = _hb_set_destroy = wasmExports2["hb_set_destroy"];
          Module["_hb_ot_var_get_axis_infos"] = _hb_ot_var_get_axis_infos = wasmExports2["hb_ot_var_get_axis_infos"];
          Module["_hb_set_get_population"] = _hb_set_get_population = wasmExports2["hb_set_get_population"];
          Module["_hb_set_next_many"] = _hb_set_next_many = wasmExports2["hb_set_next_many"];
          Module["_hb_shape"] = _hb_shape = wasmExports2["hb_shape"];
          __emscripten_timeout = wasmExports2["_emscripten_timeout"];
        }
        var wasmImports = { _abort_js: __abort_js, _emscripten_runtime_keepalive_clear: __emscripten_runtime_keepalive_clear, _setitimer_js: __setitimer_js, emscripten_resize_heap: _emscripten_resize_heap, proc_exit: _proc_exit };
        var wasmExports = await createWasm();
        function run() {
          if (runDependencies > 0) {
            dependenciesFulfilled = run;
            return;
          }
          preRun();
          if (runDependencies > 0) {
            dependenciesFulfilled = run;
            return;
          }
          function doRun() {
            Module["calledRun"] = true;
            if (ABORT) return;
            initRuntime();
            readyPromiseResolve?.(Module);
            Module["onRuntimeInitialized"]?.();
            postRun();
          }
          if (Module["setStatus"]) {
            Module["setStatus"]("Running...");
            setTimeout(() => {
              setTimeout(() => Module["setStatus"](""), 1);
              doRun();
            }, 1);
          } else {
            doRun();
          }
        }
        function preInit() {
          if (Module["preInit"]) {
            if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
            while (Module["preInit"].length > 0) {
              Module["preInit"].shift()();
            }
          }
        }
        preInit();
        run();
        if (runtimeInitialized) {
          moduleRtn = Module;
        } else {
          moduleRtn = new Promise((resolve, reject) => {
            readyPromiseResolve = resolve;
            readyPromiseReject = reject;
          });
        }
        ;
        return moduleRtn;
      };
    })();
    if (typeof exports === "object" && typeof module === "object") {
      module.exports = createHarfBuzz2;
      module.exports.default = createHarfBuzz2;
    } else if (typeof define === "function" && define["amd"]) define([], () => createHarfBuzz2);
  }
});

// node_modules/harfbuzzjs/hbjs.js
var require_hbjs = __commonJS({
  "node_modules/harfbuzzjs/hbjs.js"(exports, module) {
    function hbjs2(Module) {
      "use strict";
      var exports2 = Module.wasmExports;
      var utf8Decoder = new TextDecoder("utf8");
      let addFunction = Module.addFunction;
      let removeFunction = Module.removeFunction;
      var freeFuncPtr = addFunction(function(ptr) {
        exports2.free(ptr);
      }, "vi");
      var HB_MEMORY_MODE_WRITABLE = 2;
      var HB_SET_VALUE_INVALID = -1;
      var HB_BUFFER_CONTENT_TYPE_GLYPHS = 2;
      var DONT_STOP = 0;
      var GSUB_PHASE = 1;
      var GPOS_PHASE = 2;
      function hb_tag(s) {
        return (s.charCodeAt(0) & 255) << 24 | (s.charCodeAt(1) & 255) << 16 | (s.charCodeAt(2) & 255) << 8 | (s.charCodeAt(3) & 255) << 0;
      }
      var HB_BUFFER_SERIALIZE_FORMAT_JSON = hb_tag("JSON");
      var HB_BUFFER_SERIALIZE_FLAG_NO_GLYPH_NAMES = 4;
      function _hb_untag(tag) {
        return [
          String.fromCharCode(tag >> 24 & 255),
          String.fromCharCode(tag >> 16 & 255),
          String.fromCharCode(tag >> 8 & 255),
          String.fromCharCode(tag >> 0 & 255)
        ].join("");
      }
      function _buffer_flag(s) {
        if (s == "BOT") {
          return 1;
        }
        if (s == "EOT") {
          return 2;
        }
        if (s == "PRESERVE_DEFAULT_IGNORABLES") {
          return 4;
        }
        if (s == "REMOVE_DEFAULT_IGNORABLES") {
          return 8;
        }
        if (s == "DO_NOT_INSERT_DOTTED_CIRCLE") {
          return 16;
        }
        if (s == "PRODUCE_UNSAFE_TO_CONCAT") {
          return 64;
        }
        return 0;
      }
      function createBlob(blob) {
        var blobPtr = exports2.malloc(blob.byteLength);
        Module.HEAPU8.set(new Uint8Array(blob), blobPtr);
        var ptr = exports2.hb_blob_create(blobPtr, blob.byteLength, HB_MEMORY_MODE_WRITABLE, blobPtr, freeFuncPtr);
        return {
          ptr,
          /**
          * Free the object.
          */
          destroy: function() {
            exports2.hb_blob_destroy(ptr);
          }
        };
      }
      function typedArrayFromSet(setPtr) {
        const setCount = exports2.hb_set_get_population(setPtr);
        const arrayPtr = exports2.malloc(setCount << 2);
        const arrayOffset = arrayPtr >> 2;
        const array = Module.HEAPU32.subarray(arrayOffset, arrayOffset + setCount);
        Module.HEAPU32.set(array, arrayOffset);
        exports2.hb_set_next_many(setPtr, HB_SET_VALUE_INVALID, arrayPtr, setCount);
        return array;
      }
      function createFace(blob, index) {
        var ptr = exports2.hb_face_create(blob.ptr, index);
        const upem = exports2.hb_face_get_upem(ptr);
        return {
          ptr,
          upem,
          /**
           * Return the binary contents of an OpenType table.
           * @param {string} table Table name
           */
          reference_table: function(table) {
            var blob2 = exports2.hb_face_reference_table(ptr, hb_tag(table));
            var length = exports2.hb_blob_get_length(blob2);
            if (!length) {
              return;
            }
            var blobptr = exports2.hb_blob_get_data(blob2, null);
            var table_string = Module.HEAPU8.subarray(blobptr, blobptr + length);
            return table_string;
          },
          /**
           * Return variation axis infos
           */
          getAxisInfos: function() {
            var axis = exports2.malloc(64 * 32);
            var c = exports2.malloc(4);
            Module.HEAPU32[c / 4] = 64;
            exports2.hb_ot_var_get_axis_infos(ptr, 0, c, axis);
            var result = {};
            Array.from({ length: Module.HEAPU32[c / 4] }).forEach(function(_, i) {
              result[_hb_untag(Module.HEAPU32[axis / 4 + i * 8 + 1])] = {
                min: Module.HEAPF32[axis / 4 + i * 8 + 4],
                default: Module.HEAPF32[axis / 4 + i * 8 + 5],
                max: Module.HEAPF32[axis / 4 + i * 8 + 6]
              };
            });
            exports2.free(c);
            exports2.free(axis);
            return result;
          },
          /**
           * Return unicodes the face supports
           */
          collectUnicodes: function() {
            var unicodeSetPtr = exports2.hb_set_create();
            exports2.hb_face_collect_unicodes(ptr, unicodeSetPtr);
            var result = typedArrayFromSet(unicodeSetPtr);
            exports2.hb_set_destroy(unicodeSetPtr);
            return result;
          },
          /**
           * Free the object.
           */
          destroy: function() {
            exports2.hb_face_destroy(ptr);
          }
        };
      }
      var pathBuffer = "";
      var nameBufferSize = 256;
      var nameBuffer = exports2.malloc(nameBufferSize);
      function createFont(face) {
        var ptr = exports2.hb_font_create(face.ptr);
        var drawFuncsPtr = null;
        var moveToPtr = null;
        var lineToPtr = null;
        var cubicToPtr = null;
        var quadToPtr = null;
        var closePathPtr = null;
        function glyphToPath(glyphId) {
          if (!drawFuncsPtr) {
            var moveTo = function(dfuncs, draw_data, draw_state, to_x, to_y, user_data) {
              pathBuffer += `M${to_x},${to_y}`;
            };
            var lineTo = function(dfuncs, draw_data, draw_state, to_x, to_y, user_data) {
              pathBuffer += `L${to_x},${to_y}`;
            };
            var cubicTo = function(dfuncs, draw_data, draw_state, c1_x, c1_y, c2_x, c2_y, to_x, to_y, user_data) {
              pathBuffer += `C${c1_x},${c1_y} ${c2_x},${c2_y} ${to_x},${to_y}`;
            };
            var quadTo = function(dfuncs, draw_data, draw_state, c_x, c_y, to_x, to_y, user_data) {
              pathBuffer += `Q${c_x},${c_y} ${to_x},${to_y}`;
            };
            var closePath = function(dfuncs, draw_data, draw_state, user_data) {
              pathBuffer += "Z";
            };
            moveToPtr = addFunction(moveTo, "viiiffi");
            lineToPtr = addFunction(lineTo, "viiiffi");
            cubicToPtr = addFunction(cubicTo, "viiiffffffi");
            quadToPtr = addFunction(quadTo, "viiiffffi");
            closePathPtr = addFunction(closePath, "viiii");
            drawFuncsPtr = exports2.hb_draw_funcs_create();
            exports2.hb_draw_funcs_set_move_to_func(drawFuncsPtr, moveToPtr, 0, 0);
            exports2.hb_draw_funcs_set_line_to_func(drawFuncsPtr, lineToPtr, 0, 0);
            exports2.hb_draw_funcs_set_cubic_to_func(drawFuncsPtr, cubicToPtr, 0, 0);
            exports2.hb_draw_funcs_set_quadratic_to_func(drawFuncsPtr, quadToPtr, 0, 0);
            exports2.hb_draw_funcs_set_close_path_func(drawFuncsPtr, closePathPtr, 0, 0);
          }
          pathBuffer = "";
          exports2.hb_font_draw_glyph(ptr, glyphId, drawFuncsPtr, 0);
          return pathBuffer;
        }
        function glyphName(glyphId) {
          exports2.hb_font_glyph_to_string(
            ptr,
            glyphId,
            nameBuffer,
            nameBufferSize
          );
          var array = Module.HEAPU8.subarray(nameBuffer, nameBuffer + nameBufferSize);
          return utf8Decoder.decode(array.slice(0, array.indexOf(0)));
        }
        return {
          ptr,
          glyphName,
          glyphToPath,
          /**
          * Return a glyph as a JSON path string
          * based on format described on https://svgwg.org/specs/paths/#InterfaceSVGPathSegment
          * @param {number} glyphId ID of the requested glyph in the font.
          **/
          glyphToJson: function(glyphId) {
            var path = glyphToPath(glyphId);
            return path.replace(/([MLQCZ])/g, "|$1 ").split("|").filter(function(x) {
              return x.length;
            }).map(function(x) {
              var row = x.split(/[ ,]/g);
              return { type: row[0], values: row.slice(1).filter(function(x2) {
                return x2.length;
              }).map(function(x2) {
                return +x2;
              }) };
            });
          },
          /**
          * Set the font's scale factor, affecting the position values returned from
          * shaping.
          * @param {number} xScale Units to scale in the X dimension.
          * @param {number} yScale Units to scale in the Y dimension.
          **/
          setScale: function(xScale, yScale) {
            exports2.hb_font_set_scale(ptr, xScale, yScale);
          },
          /**
           * Set the font's variations.
           * @param {object} variations Dictionary of variations to set
           **/
          setVariations: function(variations) {
            var entries = Object.entries(variations);
            var vars = exports2.malloc(8 * entries.length);
            entries.forEach(function(entry, i) {
              Module.HEAPU32[vars / 4 + i * 2 + 0] = hb_tag(entry[0]);
              Module.HEAPF32[vars / 4 + i * 2 + 1] = entry[1];
            });
            exports2.hb_font_set_variations(ptr, vars, entries.length);
            exports2.free(vars);
          },
          /**
          * Free the object.
          */
          destroy: function() {
            exports2.hb_font_destroy(ptr);
            if (drawFuncsPtr) {
              exports2.hb_draw_funcs_destroy(drawFuncsPtr);
              drawFuncsPtr = null;
              removeFunction(moveToPtr);
              removeFunction(lineToPtr);
              removeFunction(cubicToPtr);
              removeFunction(quadToPtr);
              removeFunction(closePathPtr);
            }
          }
        };
      }
      function createAsciiString(text) {
        var ptr = exports2.malloc(text.length + 1);
        for (let i = 0; i < text.length; ++i) {
          const char = text.charCodeAt(i);
          if (char > 127) throw new Error("Expected ASCII text");
          Module.HEAPU8[ptr + i] = char;
        }
        Module.HEAPU8[ptr + text.length] = 0;
        return {
          ptr,
          length: text.length,
          free: function() {
            exports2.free(ptr);
          }
        };
      }
      function createJsString(text) {
        const ptr = exports2.malloc(text.length * 2);
        const words = new Uint16Array(Module.wasmMemory.buffer, ptr, text.length);
        for (let i = 0; i < words.length; ++i) words[i] = text.charCodeAt(i);
        return {
          ptr,
          length: words.length,
          free: function() {
            exports2.free(ptr);
          }
        };
      }
      function createBuffer() {
        var ptr = exports2.hb_buffer_create();
        return {
          ptr,
          /**
          * Add text to the buffer.
          * @param {string} text Text to be added to the buffer.
          **/
          addText: function(text) {
            const str = createJsString(text);
            exports2.hb_buffer_add_utf16(ptr, str.ptr, str.length, 0, str.length);
            str.free();
          },
          /**
          * Set buffer script, language and direction.
          *
          * This needs to be done before shaping.
          **/
          guessSegmentProperties: function() {
            return exports2.hb_buffer_guess_segment_properties(ptr);
          },
          /**
          * Set buffer direction explicitly.
          * @param {string} direction: One of "ltr", "rtl", "ttb" or "btt"
          */
          setDirection: function(dir) {
            exports2.hb_buffer_set_direction(ptr, {
              ltr: 4,
              rtl: 5,
              ttb: 6,
              btt: 7
            }[dir] || 0);
          },
          /**
          * Set buffer flags explicitly.
          * @param {string[]} flags: A list of strings which may be either:
          * "BOT"
          * "EOT"
          * "PRESERVE_DEFAULT_IGNORABLES"
          * "REMOVE_DEFAULT_IGNORABLES"
          * "DO_NOT_INSERT_DOTTED_CIRCLE"
          * "PRODUCE_UNSAFE_TO_CONCAT"
          */
          setFlags: function(flags) {
            var flagValue = 0;
            flags.forEach(function(s) {
              flagValue |= _buffer_flag(s);
            });
            exports2.hb_buffer_set_flags(ptr, flagValue);
          },
          /**
          * Set buffer language explicitly.
          * @param {string} language: The buffer language
          */
          setLanguage: function(language) {
            var str = createAsciiString(language);
            exports2.hb_buffer_set_language(ptr, exports2.hb_language_from_string(str.ptr, -1));
            str.free();
          },
          /**
          * Set buffer script explicitly.
          * @param {string} script: The buffer script
          */
          setScript: function(script) {
            var str = createAsciiString(script);
            exports2.hb_buffer_set_script(ptr, exports2.hb_script_from_string(str.ptr, -1));
            str.free();
          },
          /**
          * Set the Harfbuzz clustering level.
          *
          * Affects the cluster values returned from shaping.
          * @param {number} level: Clustering level. See the Harfbuzz manual chapter
          * on Clusters.
          **/
          setClusterLevel: function(level) {
            exports2.hb_buffer_set_cluster_level(ptr, level);
          },
          /**
          * Return the buffer contents as a JSON object.
          *
          * After shaping, this function will return an array of glyph information
          * objects. Each object will have the following attributes:
          *
          *   - g: The glyph ID
          *   - cl: The cluster ID
          *   - ax: Advance width (width to advance after this glyph is painted)
          *   - ay: Advance height (height to advance after this glyph is painted)
          *   - dx: X displacement (adjustment in X dimension when painting this glyph)
          *   - dy: Y displacement (adjustment in Y dimension when painting this glyph)
          *   - flags: Glyph flags like `HB_GLYPH_FLAG_UNSAFE_TO_BREAK` (0x1)
          **/
          json: function() {
            var length = exports2.hb_buffer_get_length(ptr);
            var result = [];
            var infosPtr = exports2.hb_buffer_get_glyph_infos(ptr, 0);
            var infosPtr32 = infosPtr / 4;
            var positionsPtr32 = exports2.hb_buffer_get_glyph_positions(ptr, 0) / 4;
            var infos = Module.HEAPU32.subarray(infosPtr32, infosPtr32 + 5 * length);
            var positions = Module.HEAP32.subarray(positionsPtr32, positionsPtr32 + 5 * length);
            for (var i = 0; i < length; ++i) {
              result.push({
                g: infos[i * 5 + 0],
                cl: infos[i * 5 + 2],
                ax: positions[i * 5 + 0],
                ay: positions[i * 5 + 1],
                dx: positions[i * 5 + 2],
                dy: positions[i * 5 + 3],
                flags: exports2.hb_glyph_info_get_glyph_flags(infosPtr + i * 20)
              });
            }
            return result;
          },
          /**
          * Free the object.
          */
          destroy: function() {
            exports2.hb_buffer_destroy(ptr);
          }
        };
      }
      function shape(font, buffer, features) {
        var featuresPtr = 0;
        var featuresLen = 0;
        if (features) {
          features = features.split(",");
          featuresPtr = exports2.malloc(16 * features.length);
          features.forEach(function(feature, i) {
            var str = createAsciiString(feature);
            if (exports2.hb_feature_from_string(str.ptr, -1, featuresPtr + featuresLen * 16))
              featuresLen++;
            str.free();
          });
        }
        exports2.hb_shape(font.ptr, buffer.ptr, featuresPtr, featuresLen);
        if (featuresPtr)
          exports2.free(featuresPtr);
      }
      function shapeWithTrace(font, buffer, features, stop_at, stop_phase) {
        var trace = [];
        var currentPhase = DONT_STOP;
        var stopping = false;
        var failure = false;
        var traceBufLen = 1024 * 1024;
        var traceBufPtr = exports2.malloc(traceBufLen);
        var traceFunc = function(bufferPtr, fontPtr, messagePtr, user_data) {
          var message = utf8Decoder.decode(Module.HEAPU8.subarray(messagePtr, Module.HEAPU8.indexOf(0, messagePtr)));
          if (message.startsWith("start table GSUB"))
            currentPhase = GSUB_PHASE;
          else if (message.startsWith("start table GPOS"))
            currentPhase = GPOS_PHASE;
          if (currentPhase != stop_phase)
            stopping = false;
          if (failure)
            return 1;
          if (stop_phase != DONT_STOP && currentPhase == stop_phase && message.startsWith("end lookup " + stop_at))
            stopping = true;
          if (stopping)
            return 0;
          exports2.hb_buffer_serialize_glyphs(
            bufferPtr,
            0,
            exports2.hb_buffer_get_length(bufferPtr),
            traceBufPtr,
            traceBufLen,
            0,
            fontPtr,
            HB_BUFFER_SERIALIZE_FORMAT_JSON,
            HB_BUFFER_SERIALIZE_FLAG_NO_GLYPH_NAMES
          );
          trace.push({
            m: message,
            t: JSON.parse(utf8Decoder.decode(Module.HEAPU8.subarray(traceBufPtr, Module.HEAPU8.indexOf(0, traceBufPtr)))),
            glyphs: exports2.hb_buffer_get_content_type(bufferPtr) == HB_BUFFER_CONTENT_TYPE_GLYPHS
          });
          return 1;
        };
        var traceFuncPtr = addFunction(traceFunc, "iiiii");
        exports2.hb_buffer_set_message_func(buffer.ptr, traceFuncPtr, 0, 0);
        shape(font, buffer, features, 0);
        exports2.free(traceBufPtr);
        removeFunction(traceFuncPtr);
        return trace;
      }
      function version() {
        var versionPtr = exports2.malloc(12);
        exports2.hb_version(versionPtr, versionPtr + 4, versionPtr + 8);
        var version2 = {
          major: Module.HEAPU32[versionPtr / 4],
          minor: Module.HEAPU32[(versionPtr + 4) / 4],
          micro: Module.HEAPU32[(versionPtr + 8) / 4]
        };
        exports2.free(versionPtr);
        return version2;
      }
      function version_string() {
        var versionPtr = exports2.hb_version_string();
        var version2 = utf8Decoder.decode(Module.HEAPU8.subarray(versionPtr, Module.HEAPU8.indexOf(0, versionPtr)));
        return version2;
      }
      return {
        createBlob,
        createFace,
        createFont,
        createBuffer,
        shape,
        shapeWithTrace,
        version,
        version_string
      };
    }
    try {
      module.exports = hbjs2;
    } catch (e) {
    }
  }
});

// packages/core/src/colourway.ts
var BRAND_COLOUR_TABLE = {
  navy: ["#01172B", "#415160", "#808B95", "#C0C5CA"],
  grey: ["#A6BFCC", "#BCCFD9", "#D3DFE6", "#E9EFF2"],
  yellow: ["#F2F93C", "#F5FB6D", "#F8FC9E", "#FCFECE"],
  white: ["#FFFFFF"],
  green: ["#00E76B", "#2EFF8F", "#74FFB4", "#B9FFDA"],
  blue: ["#50CFFF", "#7CDBFF", "#A7E7FF", "#D3F3FF"],
  purple: ["#AA46C3", "#BF74D2", "#D4A3E1", "#EAD1F0"],
  red: ["#F73232", "#F96565", "#FB9999", "#FDCCCC"],
  orange: ["#F26414", "#F58B4F", "#F9B28A", "#FCD8C4"]
};
var BRAND_COLOURS = {
  navy: { 100: "#01172B", 75: "#415160", 50: "#808B95", 25: "#C0C5CA" },
  grey: { 100: "#A6BFCC", 75: "#BCCFD9", 50: "#D3DFE6", 25: "#E9EFF2" },
  yellow: { 100: "#F2F93C", 75: "#F5FB6D", 50: "#F8FC9E", 25: "#FCFECE" },
  white: { 100: "#FFFFFF" },
  green: { 100: "#00E76B", 75: "#2EFF8F", 50: "#74FFB4", 25: "#B9FFDA" },
  blue: { 100: "#50CFFF", 75: "#7CDBFF", 50: "#A7E7FF", 25: "#D3F3FF" },
  purple: { 100: "#AA46C3", 75: "#BF74D2", 50: "#D4A3E1", 25: "#EAD1F0" },
  red: { 100: "#F73232", 75: "#F96565", 50: "#FB9999", 25: "#FDCCCC" },
  orange: { 100: "#F26414", 75: "#F58B4F", 50: "#F9B28A", 25: "#FCD8C4" }
};
var DEFAULT_COLOURWAY_ID = "navy__yellow-100";
function determineTextColours(bgColour, bgTint) {
  if (bgTint === 25 || bgColour === "white" || bgColour === "grey" || bgColour === "yellow") {
    return [BRAND_COLOURS.navy[100]];
  }
  if (bgColour === "green" || bgColour === "blue") {
    return [BRAND_COLOURS.navy[100]];
  }
  return [BRAND_COLOURS.white[100]];
}
function textColourOnFill(fill) {
  const hex = fill.toUpperCase();
  for (const name of Object.keys(BRAND_COLOURS)) {
    const tints = BRAND_COLOURS[name];
    for (const tint of Object.keys(tints).map(Number)) {
      if (tints[tint].toUpperCase() === hex) return determineTextColours(name, tint)[0];
    }
  }
  return BRAND_COLOURS.navy[100];
}
function getBrandHex(colour, tint) {
  const table = BRAND_COLOURS[colour];
  const hex = table[tint];
  if (!hex) {
    throw new Error(`Unknown tint ${tint} for brand colour ${colour}`);
  }
  return hex;
}
function createEntry(index, group, bgColour, bgTint, family, tints) {
  const bgPrefix = bgTint === 100 ? bgColour : `${bgColour}-${bgTint}`;
  const id = `${bgPrefix}__${family}-${tints.join("-")}`;
  const background = getBrandHex(bgColour, bgTint);
  const tintHexes = tints.map((t) => getBrandHex(family, t));
  const textColours = determineTextColours(bgColour, bgTint);
  return {
    id,
    index,
    group,
    background,
    tints: tintHexes,
    textColours
  };
}
function buildColourways() {
  const list = [];
  const legacy = /* @__PURE__ */ new Map();
  let index = 0;
  const add = (group, bg, bgTint, family, tints) => {
    const entry = createEntry(index++, group, bg, bgTint, family, tints);
    if (tints.length === 1) list.push(entry);
    else legacy.set(entry.index, entry.id);
  };
  add("primary", "navy", 100, "yellow", [100]);
  add("primary", "navy", 100, "yellow", [100, 50]);
  add("primary", "navy", 100, "grey", [100]);
  add("primary", "navy", 100, "grey", [100, 50]);
  add("primary", "navy", 100, "white", [100]);
  add("primary", "grey", 100, "yellow", [100]);
  add("primary", "grey", 100, "navy", [100]);
  add("primary", "grey", 100, "white", [100]);
  add("primary", "white", 100, "yellow", [100]);
  add("primary", "white", 100, "grey", [100]);
  add("primary", "white", 100, "navy", [100]);
  const secondaryColours = ["green", "blue", "purple", "red", "orange"];
  for (const c of secondaryColours) {
    add("secondary", "navy", 100, c, [100]);
    add("secondary", "navy", 100, c, [100, 50]);
    add("secondary", c, 25, c, [100]);
    add("secondary", c, 25, c, [100, 50]);
    add("secondary", c, 100, "white", [100]);
    add("secondary", c, 100, "navy", [100]);
  }
  return { list, legacy };
}
var BUILT = buildColourways();
var LEGACY_COLOURWAY_IDS = BUILT.legacy;
var COLOURWAYS_LIST = Object.freeze(BUILT.list);
var COLOURWAYS = Object.freeze(
  Object.fromEntries(COLOURWAYS_LIST.map((c) => [c.id, c]))
);
function listColourways() {
  return [...COLOURWAYS_LIST];
}
function getColourway(id) {
  if (typeof id === "number") {
    return COLOURWAYS_LIST.find((c) => c.index === id);
  }
  return COLOURWAYS[id];
}
function migrateColourwayId(id) {
  return id.endsWith("-100-50") ? id.slice(0, -3) : id;
}
function colourwayForIndex(index) {
  const legacy = LEGACY_COLOURWAY_IDS.get(index);
  return legacy ? getColourway(migrateColourwayId(legacy)) : getColourway(index);
}

// packages/core/src/constants.ts
var SQUARE_FORMAT = {
  id: "square",
  label: "Square",
  widthPx: 1920,
  heightPx: 1920
};
var PRIMARY_NAVY_YELLOW = getColourway(DEFAULT_COLOURWAY_ID);

// packages/core/src/formats.ts
var FORMATS = [
  { id: "square", label: "Square", widthPx: 1920, heightPx: 1920 },
  { id: "portrait-4-5", label: "Portrait 4:5", widthPx: 1920, heightPx: 2400 },
  { id: "story-9-16", label: "Story 9:16", widthPx: 1080, heightPx: 1920 },
  { id: "screen-16-9", label: "Screen 16:9", widthPx: 1920, heightPx: 1080 },
  { id: "a4-portrait", label: "A4 Portrait", widthPx: 2480, heightPx: 3508 },
  { id: "a4-landscape", label: "A4 Landscape", widthPx: 3508, heightPx: 2480 },
  { id: "link-1-91", label: "Link Preview 1.91:1", widthPx: 1200, heightPx: 628 },
  { id: "custom", label: "Custom" }
];
function listFormats() {
  return [...FORMATS];
}
var DENSITY_TABLES = {
  square: [
    { level: "coarse", cols: 4, rows: 4, isCiStandard: false },
    { level: "medium", cols: 8, rows: 8, isCiStandard: false },
    { level: "fine", cols: 16, rows: 16, isCiStandard: true },
    { level: "extra-fine", cols: 32, rows: 32, isCiStandard: false }
  ],
  "portrait-4-5": [
    { level: "medium", cols: 8, rows: 10, isCiStandard: false },
    { level: "fine", cols: 16, rows: 20, isCiStandard: true },
    { level: "extra-fine", cols: 32, rows: 40, isCiStandard: false }
  ],
  "story-9-16": [
    { level: "medium", cols: 9, rows: 16, isCiStandard: false },
    { level: "fine", cols: 18, rows: 32, isCiStandard: false },
    { level: "extra-fine", cols: 27, rows: 48, isCiStandard: true }
  ],
  "screen-16-9": [
    { level: "medium", cols: 16, rows: 9, isCiStandard: false },
    { level: "fine", cols: 32, rows: 18, isCiStandard: false },
    { level: "extra-fine", cols: 48, rows: 27, isCiStandard: true }
  ],
  "a4-portrait": [
    { level: "fine", cols: 24, rows: 34, isCiStandard: true }
  ],
  "a4-landscape": [
    { level: "fine", cols: 34, rows: 24, isCiStandard: true }
  ],
  /**
   * Link preview 1.91:1 rule:
   * Pixel dimensions are 1200x628 (aspect ratio 1.91083).
   * Medium (16 cols): ideal rows = 16 * (628 / 1200) = 8.373 -> 8 rows yields cellW 75, cellH 78.5
   * (within 4.7% of square, both counts even).
   * Fine (32 cols): ideal rows = 32 * (628 / 1200) = 16.75 -> 16 rows yields cellW 37.5, cellH 39.25
   * (within 4.7% of square, both counts even, CI standard).
   */
  "link-1-91": [
    { level: "medium", cols: 16, rows: 8, isCiStandard: false },
    { level: "fine", cols: 32, rows: 16, isCiStandard: true }
  ]
};
function formatDensityLabel(level) {
  switch (level) {
    case "coarse":
      return "Coarse";
    case "medium":
      return "Medium";
    case "fine":
      return "Fine";
    case "extra-fine":
      return "Extra fine";
  }
}
function pickLongSideCount(shortPx, longPx, shortCount) {
  const idealL = longPx / shortPx * shortCount;
  const floorL = Math.max(1, Math.floor(idealL));
  const ceilL = Math.max(1, Math.ceil(idealL));
  if (floorL === ceilL) return floorL;
  const cellShort = shortPx / shortCount;
  const devFloor = Math.abs(longPx / floorL / cellShort - 1);
  const devCeil = Math.abs(longPx / ceilL / cellShort - 1);
  if (Math.abs(devFloor - devCeil) < 1e-5) {
    if (floorL % 2 === 0) return floorL;
    if (ceilL % 2 === 0) return ceilL;
    return floorL;
  }
  if (Math.abs(idealL - floorL - 0.5) < 1e-5) {
    if (floorL % 2 === 0) return floorL;
    if (ceilL % 2 === 0) return ceilL;
  }
  return devFloor < devCeil ? floorL : ceilL;
}
function customDensityLevels(customSize) {
  const widthPx = customSize?.widthPx ?? 1920;
  const heightPx = customSize?.heightPx ?? 1080;
  const shortPx = Math.min(widthPx, heightPx);
  const longPx = Math.max(widthPx, heightPx);
  const isWidthShort = widthPx <= heightPx;
  const targets = [
    { level: "coarse", shortCount: 4, isCiStandard: false },
    { level: "medium", shortCount: 8, isCiStandard: false },
    { level: "fine", shortCount: 16, isCiStandard: true },
    { level: "extra-fine", shortCount: 32, isCiStandard: false }
  ];
  return targets.map(({ level, shortCount, isCiStandard }) => {
    const longCount = pickLongSideCount(shortPx, longPx, shortCount);
    const cols = isWidthShort ? shortCount : longCount;
    const rows = isWidthShort ? longCount : shortCount;
    const cellW = widthPx / cols;
    const cellH = heightPx / rows;
    const isExact = widthPx * rows === heightPx * cols;
    const cellPx = isExact ? cellW : void 0;
    return {
      level,
      density: level,
      id: level,
      label: formatDensityLabel(level),
      cols,
      rows,
      isCiStandard,
      cellW,
      cellH,
      ...isExact ? { cellPx } : {}
    };
  });
}
function densityLevelsFor(formatInput, customSizeInput) {
  const format = typeof formatInput === "object" && formatInput !== null ? formatInput.format : formatInput;
  const customSize = typeof formatInput === "object" && formatInput !== null ? formatInput.customSize ?? customSizeInput : customSizeInput;
  if (format === "custom") {
    return customDensityLevels(customSize);
  }
  const entries = DENSITY_TABLES[format];
  if (!entries) {
    return [];
  }
  const formatDef = FORMATS.find((f) => f.id === format);
  const width = formatDef?.widthPx ?? 1920;
  const height = formatDef?.heightPx ?? 1920;
  return entries.map((entry) => {
    const isExact = width * entry.rows === height * entry.cols;
    const cellW = width / entry.cols;
    const cellH = height / entry.rows;
    const cellPx = isExact ? cellW : void 0;
    return {
      level: entry.level,
      density: entry.level,
      id: entry.level,
      label: formatDensityLabel(entry.level),
      cols: entry.cols,
      rows: entry.rows,
      isCiStandard: entry.isCiStandard,
      cellW,
      cellH,
      ...isExact ? { cellPx } : {}
    };
  });
}
function getFormatDimensions(doc) {
  if (doc.format === "custom") {
    return {
      widthPx: doc.customSize?.widthPx ?? 1920,
      heightPx: doc.customSize?.heightPx ?? 1080
    };
  }
  const formatDef = FORMATS.find((f) => f.id === doc.format);
  return {
    widthPx: formatDef?.widthPx ?? 1920,
    heightPx: formatDef?.heightPx ?? 1920
  };
}

// packages/core/src/patternRules.ts
var COVERAGE_LIMIT = [0.2, 0.75];
function adjacent(a, b) {
  return a.col <= b.col + b.w && b.col <= a.col + a.w && a.row <= b.row + b.h && b.row <= a.row + a.h;
}
function patternMasses(blocks) {
  const parent = blocks.map((_, i) => i);
  const find = (i) => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      if (adjacent(blocks[i], blocks[j])) parent[find(i)] = find(j);
    }
  }
  const groups = /* @__PURE__ */ new Map();
  blocks.forEach((_, i) => {
    const root = find(i);
    const g = groups.get(root);
    if (g) g.push(i);
    else groups.set(root, [i]);
  });
  return [...groups.values()];
}
function touchesPageEdge(blocks, grid) {
  return blocks.some(
    (b) => b.col === 0 || b.row === 0 || b.col + b.w === grid.cols || b.row + b.h === grid.rows
  );
}
function checkPatternRules(blocks, grid) {
  const violations = [];
  if (blocks.length === 0) return { ok: true, violations };
  const masses = patternMasses(blocks).length;
  if (masses > 1) violations.push(`disconnected: the Blocks form ${masses} separate masses instead of one`);
  if (!touchesPageEdge(blocks, grid)) violations.push("noEdge: the Pattern does not touch any edge of the Page");
  if (blocks.length >= 2) {
    const covered = blocks.reduce((a, b) => a + b.w * b.h, 0) / (grid.cols * grid.rows);
    if (covered > COVERAGE_LIMIT[1]) {
      violations.push(`coverage: the Blocks cover ${Math.round(covered * 100)}% of the Page (at most ${COVERAGE_LIMIT[1] * 100}%)`);
    }
  }
  return { ok: violations.length === 0, violations };
}
var overlaps = (a, b) => a.col < b.col + b.w && b.col < a.col + a.w && a.row < b.row + b.h && b.row < a.row + a.h;
function repairPatternRules(blocks, grid, fixed = /* @__PURE__ */ new Set(), bounds = { col: 0, row: 0, w: grid.cols, h: grid.rows }) {
  let out = blocks.map((b) => ({ ...b }));
  const inGrid = (b) => b.col >= bounds.col && b.row >= bounds.row && b.col + b.w <= bounds.col + bounds.w && b.row + b.h <= bounds.row + bounds.h;
  for (let guard = 0; guard < blocks.length; guard++) {
    const masses = patternMasses(out);
    if (masses.length <= 1) break;
    const area = (m) => m.reduce((a, i) => a + out[i].w * out[i].h, 0);
    const anchored = (m) => m.some((i) => fixed.has(i)) ? 1 : 0;
    masses.sort((a, b) => anchored(b) - anchored(a) || area(b) - area(a));
    if (masses.slice(1).some((m) => anchored(m))) return null;
    const main = masses[0].map((i) => out[i]);
    let best = null;
    for (const mass2 of masses.slice(1)) {
      const others = out.filter((_, i) => !mass2.includes(i));
      for (let d = 1; d <= grid.cols + grid.rows && (!best || d < best.dist); d++) {
        for (let dc2 = -d; dc2 <= d; dc2++) {
          const rem = d - Math.abs(dc2);
          for (const dr2 of rem === 0 ? [0] : [-rem, rem]) {
            const moved = mass2.map((i) => ({ ...out[i], col: out[i].col + dc2, row: out[i].row + dr2 }));
            if (!moved.every(inGrid)) continue;
            if (moved.some((m) => others.some((o) => overlaps(m, o)))) continue;
            if (moved.some((m) => main.some((o) => adjacent(m, o))) && (!best || d < best.dist)) {
              best = { mass: mass2, dc: dc2, dr: dr2, dist: d };
            }
          }
        }
      }
    }
    if (!best) return null;
    const { mass, dc, dr } = best;
    out = out.map((b, i) => mass.includes(i) ? { ...b, col: b.col + dc, row: b.row + dr } : b);
  }
  if (!touchesPageEdge(out, grid)) {
    if (fixed.size > 0) return null;
    const gaps = [
      { dc: -Math.min(...out.map((b) => b.col)), dr: 0, reach: bounds.col === 0 },
      { dc: 0, dr: grid.rows - Math.max(...out.map((b) => b.row + b.h)), reach: bounds.row + bounds.h === grid.rows },
      { dc: grid.cols - Math.max(...out.map((b) => b.col + b.w)), dr: 0, reach: bounds.col + bounds.w === grid.cols },
      { dc: 0, dr: -Math.min(...out.map((b) => b.row)), reach: bounds.row === 0 }
    ].filter((g) => g.reach);
    if (gaps.length === 0) return null;
    const nearest2 = gaps.reduce((best, g) => Math.abs(g.dc + g.dr) < Math.abs(best.dc + best.dr) ? g : best);
    out = out.map((b) => ({ ...b, col: b.col + nearest2.dc, row: b.row + nearest2.dr }));
  }
  return out;
}

// packages/core/src/referencePatternMasks.ts
var REFERENCE_PATTERN_MASKS = [
  {
    figmaNode: "70:778",
    source: "patterns-v1",
    mask: [
      "..........######",
      "..........######",
      "..##############",
      "..##############",
      "..##############",
      "..##############",
      "..########......",
      "..########......",
      "##########......",
      "##########......",
      "##..............",
      "##..............",
      "##..............",
      "##..............",
      "##..............",
      "##.............."
    ]
  },
  {
    figmaNode: "71:261",
    source: "patterns-v1",
    mask: [
      "################",
      "################",
      "################",
      "################",
      "################",
      ".###############",
      ".###############",
      ".###############",
      ".###############",
      ".........#######",
      ".........#######",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "71:2",
    source: "patterns-v1",
    mask: [
      "........########",
      "........########",
      "........########",
      "........########",
      "........########",
      "........########",
      "........########",
      "..########......",
      "..########......",
      "..########......",
      "###.............",
      "###.............",
      "###.............",
      "###.............",
      "###.............",
      "###............."
    ]
  },
  {
    figmaNode: "70:520",
    source: "patterns-v1",
    mask: [
      ".....###########",
      ".....###########",
      ".....###########",
      ".....###########",
      ".....###########",
      ".....###########",
      ".....###########",
      "..##############",
      "..##############",
      "..##############",
      "..######........",
      "..######........",
      "..######........",
      "##..............",
      "##..............",
      "##.............."
    ]
  },
  {
    figmaNode: "71:1986",
    source: "patterns-v1",
    mask: [
      "........########",
      "........########",
      "........########",
      "........########",
      "........########",
      "........########",
      "....############",
      "....#######.....",
      "....#######.....",
      ".##########.....",
      ".######.........",
      "#######.........",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "71:635",
    source: "patterns-v1",
    mask: [
      ".............##.",
      "..........#####.",
      "..........#####.",
      "....###...#####.",
      "....###########.",
      "....###########.",
      "....###########.",
      ".......########.",
      ".......######...",
      ".......######...",
      "...........##...",
      "...........##...",
      "...........##...",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "71:1214",
    source: "patterns-v1",
    mask: [
      ".............###",
      ".............###",
      "###..........###",
      "###.......######",
      "###.......######",
      "######....######",
      "######....######",
      "######....######",
      "######....######",
      "################",
      "#############...",
      "#############...",
      "...##########...",
      "...#######......",
      "...#######......",
      ".......###......"
    ]
  },
  {
    figmaNode: "71:2247",
    source: "patterns-v1",
    mask: [
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "..##############",
      "..##############",
      "..##############",
      "..########......",
      "..########......",
      "..########......",
      "###.............",
      "###.............",
      "###............."
    ]
  },
  {
    figmaNode: "71:2505",
    source: "patterns-v1",
    mask: [
      "................",
      "................",
      "................",
      "................",
      ".........#######",
      "#........#######",
      "#........#######",
      "#....###########",
      "#....###########",
      "################",
      "################",
      "################",
      "################",
      "################",
      "#########.......",
      "#########......."
    ]
  },
  {
    figmaNode: "71:892",
    source: "patterns-v1",
    mask: [
      "........########",
      "........########",
      "..##############",
      "..##############",
      "..##############",
      "..##############",
      "..########......",
      "..########......",
      "##########......",
      "##########......",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "71:1728",
    source: "patterns-v1",
    mask: [
      ".....###########",
      ".....###########",
      ".....###########",
      ".....###########",
      ".....###########",
      ".....###########",
      ".....###########",
      ".....###########",
      "..##############",
      "..##############",
      "..#####.........",
      "..#####.........",
      "..#####.........",
      "##..............",
      "##..............",
      "##.............."
    ]
  },
  {
    figmaNode: "71:2772",
    source: "patterns-v1",
    mask: [
      "........########",
      "........########",
      "........########",
      "........########",
      ".....###########",
      ".....###########",
      "################",
      "################",
      "...#############",
      "...#############",
      "...........#####",
      "...........#####",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "71:1471",
    source: "patterns-v1",
    mask: [
      ".......#########",
      ".......#########",
      ".......#########",
      ".......#########",
      ".......#########",
      ".......#########",
      "..#########.....",
      "..#########.....",
      "..#########.....",
      "..#########.....",
      "###.............",
      "###.............",
      "###.............",
      "###.............",
      "###.............",
      "###............."
    ]
  },
  {
    figmaNode: "71:957",
    source: "patterns-v1",
    mask: [
      "............###.",
      "............###.",
      ".........######.",
      ".........######.",
      ".........######.",
      "......#########.",
      "......#########.",
      "....########....",
      "....########....",
      "....########....",
      "....########....",
      "....########....",
      "....#####.......",
      "....#####.......",
      "....#####.......",
      "....#####......."
    ]
  },
  {
    figmaNode: "83:4002",
    source: "patterns-v1",
    mask: [
      "..............##",
      "..............##",
      "............####",
      "........##..####",
      "..##....##..####",
      "..##....##..####",
      "####..##########",
      "####..##########",
      "################",
      "################",
      "############..##",
      "##..####..##..##",
      "##..####..##..##",
      "##..##....##....",
      "##........##....",
      "##.............."
    ]
  },
  {
    figmaNode: "111:451",
    source: "patterns-v1",
    mask: [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "##..............",
      "##..............",
      "##..............",
      "##..............",
      "##..............",
      "##..............",
      "##..............",
      "##.............."
    ]
  },
  {
    figmaNode: "111:510",
    source: "patterns-v1",
    mask: [
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "111:305",
    source: "patterns-v1",
    mask: [
      "..........######",
      "..........######",
      "..##############",
      "..##############",
      "..##############",
      "..##############",
      "..########......",
      "..########......",
      "##########......",
      "##########......",
      "##..............",
      "##..............",
      "##..............",
      "##..............",
      "##..............",
      "##.............."
    ]
  },
  {
    figmaNode: "4:1060",
    source: "in-use",
    mask: [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "##..............",
      "##..............",
      "..####........##",
      "..########..####",
      "################",
      "################",
      "################"
    ]
  },
  {
    figmaNode: "18:838",
    source: "in-use",
    mask: [
      "..............##",
      "..............##",
      "..............##",
      "..............##",
      "....####......##",
      "....####......##",
      "..######..##..##",
      "..######..##..##",
      "##############..",
      "##############..",
      "##############..",
      "##############..",
      "####....####....",
      "####....####....",
      "##..............",
      "##.............."
    ]
  },
  {
    figmaNode: "93:565",
    source: "in-use",
    mask: [
      "....############",
      "....############",
      "....############",
      "....############",
      "....############",
      "....############",
      "..##############",
      "..##############",
      "..########......",
      "..########......",
      "##########......",
      "##########......",
      "####............",
      "####............",
      "#...............",
      "#..............."
    ]
  },
  {
    figmaNode: "18:1677",
    source: "in-use",
    mask: [
      ".............###",
      ".............###",
      "####.........###",
      "####......######",
      "####......######",
      "####......######",
      "#######...######",
      "#######...######",
      "#######...###...",
      "#############...",
      "....#########...",
      "....######......",
      ".......###......",
      ".......###......",
      ".......###......",
      ".......###......"
    ]
  },
  {
    figmaNode: "18:1835",
    source: "in-use",
    mask: [
      "..............##",
      "..............##",
      "..............##",
      "..............##",
      "............##..",
      "............##..",
      "....####..####..",
      "....####..####..",
      "..############..",
      "..############..",
      "##############..",
      "##############..",
      "####....##......",
      "####....##......",
      "##..............",
      "##.............."
    ]
  },
  {
    figmaNode: "18:1845",
    source: "in-use",
    mask: [
      "...............#",
      "...............#",
      "...............#",
      "...............#",
      ".............##.",
      "##...........##.",
      "##.......######.",
      "####.....####...",
      "#############...",
      "#############...",
      "#############...",
      "#############...",
      "#############...",
      "#############...",
      "###########.....",
      "########........"
    ]
  },
  {
    figmaNode: "18:1855",
    source: "in-use",
    mask: [
      "............####",
      "............####",
      "............####",
      "............####",
      "####....########",
      "####....########",
      "################",
      "################",
      "############....",
      "############....",
      "....####........",
      "....####........",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "18:1866",
    source: "in-use",
    mask: [
      ".............###",
      ".............###",
      ".............###",
      ".............###",
      ".............###",
      ".............###",
      ".....#########..",
      ".....#########..",
      ".....#########..",
      ".....#########..",
      "############....",
      "############....",
      "############....",
      "############....",
      "############....",
      "############...."
    ]
  },
  {
    figmaNode: "18:1877",
    source: "in-use",
    mask: [
      "..............##",
      "..............##",
      "..........##..##",
      "........####..##",
      "........####..##",
      "....##..####..##",
      "....############",
      "....############",
      "....############",
      "....######..####",
      "####..####....##",
      "####....##....##",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "18:1886",
    source: "in-use",
    mask: [
      "......##########",
      "......##########",
      "......##########",
      "......##########",
      "......##########",
      "......##########",
      "..##############",
      "..##############",
      "..####..........",
      "..####..........",
      "##..............",
      "##..............",
      "##..............",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "18:1914",
    source: "in-use",
    mask: [
      "..............##",
      "..............##",
      "........##....##",
      "........####..##",
      "........####..##",
      "......########..",
      "......########..",
      "......########..",
      "..############..",
      "..############..",
      "..##########....",
      "..##########....",
      "########..##....",
      "########..##....",
      "####..##........",
      "####..##........"
    ]
  },
  {
    figmaNode: "387:871",
    source: "in-use",
    mask: [
      "################",
      "################",
      "################",
      "################",
      "##########..##..",
      "##########..##..",
      "######..##......",
      "######..##......",
      "##..##..........",
      "##..##..........",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "18:887",
    source: "in-use",
    mask: [
      "................",
      "................",
      "................",
      "................",
      "............####",
      "............####",
      "........########",
      "........########",
      "################",
      "################",
      "################",
      "################",
      "################",
      "################",
      "################",
      "################"
    ]
  },
  {
    figmaNode: "18:936",
    source: "in-use",
    mask: [
      "################",
      "################",
      "################",
      "################",
      "..############..",
      "..############..",
      "....########....",
      "......####......",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "18:985",
    source: "in-use",
    mask: [
      "..........######",
      "..........######",
      "##........######",
      "##........######",
      "##....##########",
      "##....##########",
      "################",
      "################",
      "################",
      "################",
      "##########......",
      "##########......",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "16:1637",
    source: "in-use",
    mask: [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "............####",
      "........########",
      "....############",
      "..##############",
      "################",
      "################",
      "################"
    ]
  },
  {
    figmaNode: "17:407",
    source: "in-use",
    mask: [
      "........########",
      "........########",
      "........########",
      "........########",
      "....######......",
      "....######......",
      "..########......",
      "..########......",
      "#######.........",
      "#######.........",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "16:1817",
    source: "in-use",
    mask: [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "..........######",
      "##........######",
      "##....##########",
      "##....##########",
      "################",
      "################",
      "################"
    ]
  },
  {
    figmaNode: "17:436",
    source: "in-use",
    mask: [
      "..............##",
      "..............##",
      "##..........##..",
      "##....########..",
      "####..########..",
      "####..########..",
      "############....",
      "############....",
      "######..........",
      "######..........",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "7:1085",
    source: "in-use",
    mask: [
      "..............##",
      "..............##",
      "##........######",
      "##........######",
      "####......######",
      "####......######",
      "####......######",
      "####......######",
      "##..##########..",
      "##..##########..",
      "##....####......",
      "##....####......",
      "##....####......",
      "##....####......",
      "##..............",
      "##.............."
    ]
  },
  {
    figmaNode: "386:272",
    source: "in-use",
    mask: [
      "################",
      "################",
      "######..######..",
      "######..######..",
      "######..##......",
      "######..##......",
      "..####..##......",
      "..####..##......",
      "....##..........",
      "....##..........",
      "....##..........",
      "....##..........",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "386:188",
    source: "in-use",
    mask: [
      "################",
      "################",
      "################",
      "################",
      "################",
      "################",
      "........##......",
      "........##......",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "6:833",
    source: "in-use",
    mask: [
      "################",
      "################",
      "################",
      "################",
      "..##############",
      "..##############",
      "..........######",
      "..........######",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "13:479",
    source: "in-use",
    mask: [
      "................",
      "................",
      "........##......",
      "........####....",
      "......######....",
      "......########..",
      "....##########..",
      "....##########..",
      "..############..",
      "..############..",
      "##############..",
      "##############..",
      "############..##",
      "############..##",
      "########......##",
      "########......##"
    ]
  },
  {
    figmaNode: "6:682",
    source: "in-use",
    mask: [
      "........########",
      "........########",
      "....############",
      "....############",
      "################",
      "################",
      "############....",
      "############....",
      "############....",
      "####............",
      "####............",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "10:4568",
    source: "in-use",
    mask: [
      "........########",
      "....############",
      "....############",
      "....############",
      "....############",
      "....############",
      "....########....",
      "....########....",
      "########........",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "10:4596",
    source: "in-use",
    mask: [
      ".........#######",
      ".........#######",
      "#........#######",
      "#........#######",
      "#....###########",
      "#....###########",
      "################",
      "################",
      "#########.......",
      "#########.......",
      "#####...........",
      "#####...........",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "14:611",
    source: "in-use",
    mask: [
      "..............##",
      "..............##",
      "..........##..##",
      "..........##..##",
      "..##....####..##",
      "..####..####..##",
      "..############.#",
      "..############.#",
      "####..####.....#",
      "##....####.....#",
      "#.....##........",
      "#.....##........",
      "#...............",
      "#...............",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "14:630",
    source: "in-use",
    mask: [
      "..........##....",
      "..........##....",
      "....##..####..##",
      "....##..####..##",
      "....##########..",
      "......########..",
      "......######....",
      "......######....",
      "..........##....",
      "..........##....",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "10:4648",
    source: "in-use",
    mask: [
      "..............##",
      "..............##",
      "......##......##",
      "......##......##",
      "##....####....##",
      "##....####....##",
      "##..######..##..",
      "##..######..##..",
      "######..######..",
      "######..######..",
      "####......##....",
      "####......##....",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "14:653",
    source: "in-use",
    mask: [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "..........####..",
      "..........####..",
      "........########",
      "........########",
      "......##########",
      "......##########",
      "......##########",
      "......##########",
      "......##########",
      "......##########"
    ]
  },
  {
    figmaNode: "14:674",
    source: "in-use",
    mask: [
      ".............###",
      ".............###",
      ".............###",
      ".............###",
      "....###########.",
      "....###########.",
      "....###########.",
      "....###########.",
      "....###########.",
      "....###########.",
      "############....",
      "############....",
      "############....",
      "############....",
      "############....",
      "############...."
    ]
  },
  {
    figmaNode: "6:959",
    source: "in-use",
    mask: [
      "################",
      "################",
      "################",
      "################",
      "############....",
      "############....",
      "############....",
      "############....",
      "########........",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "567:197",
    source: "in-use",
    mask: [
      "..............##",
      "..............##",
      "........##....##",
      "........##....##",
      "........######..",
      "......########..",
      "##....########..",
      "##....########..",
      "##############..",
      "##############..",
      "############....",
      "############....",
      "########..##....",
      "########..##....",
      "######..........",
      "######.........."
    ]
  },
  {
    figmaNode: "6:1007",
    source: "in-use",
    mask: [
      "..............##",
      "..............##",
      "..............##",
      "..............##",
      "..............##",
      "##............##",
      "##.......#####..",
      "####.....#####..",
      "##############..",
      "##############..",
      "##############..",
      "##############..",
      "##############..",
      "##############..",
      "###########.....",
      "###########....."
    ]
  },
  {
    figmaNode: "18:2023",
    source: "in-use",
    mask: [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "............####",
      "..##############",
      "################",
      "################",
      "################",
      "################",
      "################",
      "################",
      "################"
    ]
  },
  {
    figmaNode: "668:199",
    source: "in-use",
    mask: [
      "..............##",
      "..............##",
      "........##....##",
      "........##....##",
      "....########..##",
      "....########..##",
      "..##..########..",
      "..##..########..",
      "####..##........",
      "####..##........",
      "##..............",
      "##..............",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "18:1951",
    source: "in-use",
    mask: [
      "..............##",
      "..............##",
      "..............##",
      "..##....##..####",
      "..##..####..####",
      "####..##########",
      "####..##########",
      "################",
      "################",
      "#############.##",
      "#############...",
      "#############...",
      "#############...",
      "#############...",
      "###########.....",
      "########........"
    ]
  },
  {
    figmaNode: "6:878",
    source: "in-use",
    mask: [
      "..............##",
      "..............##",
      "..............##",
      "..##....##..####",
      "..##..####..####",
      "####..##########",
      "####..##########",
      "################",
      "######..########",
      "######....##..##",
      "####......##....",
      "##..............",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "18:1034",
    source: "in-use",
    mask: [
      "..............##",
      "........##....##",
      "........##..####",
      "..##....##..####",
      "..##..##########",
      "####..########..",
      "####..##..####..",
      "########..##....",
      "######....##....",
      "##..##..........",
      "##..............",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:1",
    source: "approved",
    family: "rising",
    mask: [
      ".............###",
      ".............###",
      ".............###",
      ".............###",
      ".............###",
      ".............###",
      ".............###",
      ".........#######",
      ".........####...",
      ".........####...",
      ".........####...",
      "......#######...",
      "...##########...",
      "...##########...",
      "...##########...",
      "#############..."
    ]
  },
  {
    figmaNode: "approved:2",
    source: "approved",
    family: "hanging",
    mask: [
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "....############",
      "....############",
      "....############",
      "....############",
      "....######......",
      "....######......",
      "....######......",
      "##########......",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:3",
    source: "approved",
    family: "hanging",
    mask: [
      "........########",
      "........########",
      "........########",
      "........########",
      "........########",
      "....############",
      "....####........",
      "....####........",
      "....####........",
      "....####........",
      "########........",
      "####............",
      "####............",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:4",
    source: "approved",
    family: "hanging",
    mask: [
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "....############",
      "....######......",
      "....######......",
      "##########......",
      "##########......",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:5",
    source: "approved",
    family: "rising",
    mask: [
      "............####",
      "............####",
      "............####",
      "............####",
      "............####",
      "........########",
      "........####....",
      "........####....",
      "........####....",
      "....########....",
      "....########....",
      "....########....",
      "....####........",
      "....####........",
      "########........",
      "########........"
    ]
  },
  {
    figmaNode: "approved:6",
    source: "approved",
    family: "hanging",
    mask: [
      "........########",
      "........########",
      "........########",
      "........########",
      "........########",
      "........########",
      "....######......",
      "....######......",
      "##########......",
      "##########......",
      "######..........",
      "######..........",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:7",
    source: "approved",
    family: "hanging",
    mask: [
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "......##########",
      "......####......",
      "......####......",
      "##########......",
      "##########......",
      "##########......",
      "##########......",
      "######..........",
      "######..........",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:8",
    source: "approved",
    family: "rising",
    mask: [
      "........########",
      "........########",
      "........########",
      "........########",
      "........########",
      "........########",
      "..########......",
      "..########......",
      "..########......",
      "..########......",
      "##..............",
      "##..............",
      "##..............",
      "##..............",
      "##..............",
      "##.............."
    ]
  },
  {
    figmaNode: "approved:9",
    source: "approved",
    family: "hanging",
    mask: [
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "....############",
      "....############",
      "....############",
      "....############",
      "....######......",
      "....######......",
      "##########......",
      "##########......",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:10",
    source: "approved",
    family: "hanging",
    mask: [
      "............####",
      "............####",
      "............####",
      "............####",
      "........########",
      "........########",
      "........########",
      "........########",
      "....############",
      "....########....",
      "....########....",
      "....########....",
      "############....",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:11",
    source: "approved",
    family: "hanging",
    mask: [
      "............####",
      "............####",
      "............####",
      "............####",
      "............####",
      "........########",
      "........########",
      "........########",
      "........####....",
      "........####....",
      "........####....",
      "############....",
      "############....",
      "########........",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:12",
    source: "approved",
    family: "hanging",
    mask: [
      "............####",
      "............####",
      "............####",
      "............####",
      "............####",
      "............####",
      "........########",
      "........########",
      "....########....",
      "....########....",
      "....########....",
      "############....",
      "########........",
      "########........",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:13",
    source: "approved",
    family: "hanging",
    mask: [
      "............####",
      "............####",
      "............####",
      "........########",
      "........########",
      "........########",
      "........########",
      "....############",
      "....########....",
      "....########....",
      "....####........",
      "########........",
      "########........",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:14",
    source: "approved",
    family: "hanging",
    mask: [
      "............####",
      "............####",
      "............####",
      "............####",
      "............####",
      "......##########",
      "......######....",
      "......######....",
      "......######....",
      "......######....",
      "......######....",
      "......######....",
      "############....",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:15",
    source: "approved",
    family: "rising",
    mask: [
      "............####",
      "............####",
      "............####",
      "............####",
      "............####",
      "............####",
      "............####",
      "........########",
      "........####....",
      "........####....",
      "....########....",
      "....########....",
      "....########....",
      "....####........",
      "########........",
      "########........"
    ]
  },
  {
    figmaNode: "approved:16",
    source: "approved",
    family: "hanging",
    mask: [
      "............####",
      "............####",
      "............####",
      "............####",
      "............####",
      "........########",
      "........########",
      "........####....",
      "....########....",
      "....########....",
      "....########....",
      "....########....",
      "########........",
      "########........",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:17",
    source: "approved",
    family: "rising",
    mask: [
      "............####",
      "............####",
      "............####",
      "............####",
      "............####",
      "............####",
      "......##########",
      "......##########",
      "......######....",
      "......######....",
      "......######....",
      "......######....",
      "......######....",
      "......######....",
      "############....",
      "############...."
    ]
  },
  {
    figmaNode: "approved:18",
    source: "approved",
    family: "hanging",
    mask: [
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "......##########",
      "......##########",
      "......####......",
      "......####......",
      "##########......",
      "##########......",
      "######..........",
      "######..........",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:19",
    source: "approved",
    family: "rising",
    mask: [
      "......##########",
      "......##########",
      "......##########",
      "......##########",
      "......##########",
      "......##########",
      "..########......",
      "..########......",
      "..########......",
      "..########......",
      "##..............",
      "##..............",
      "##..............",
      "##..............",
      "##..............",
      "##.............."
    ]
  },
  {
    figmaNode: "approved:20",
    source: "approved",
    family: "hanging",
    mask: [
      "............####",
      "............####",
      "............####",
      "............####",
      "......##########",
      "......##########",
      "......######....",
      "......######....",
      "############....",
      "############....",
      "############....",
      "############....",
      "######..........",
      "######..........",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:21",
    source: "approved",
    family: "rising",
    mask: [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "..........######",
      "..........######",
      "..........######",
      "....############",
      "....############",
      "################",
      "################",
      "##########......"
    ]
  },
  {
    figmaNode: "approved:22",
    source: "approved",
    family: "rising",
    mask: [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "..........######",
      "..........######",
      "......##########",
      "......##########",
      "......##########",
      "################",
      "################",
      "################"
    ]
  },
  {
    figmaNode: "approved:23",
    source: "approved",
    family: "rising",
    mask: [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "............####",
      "............####",
      "....############",
      "....############",
      "....############",
      "################",
      "############....",
      "########........"
    ]
  },
  {
    figmaNode: "approved:24",
    source: "approved",
    family: "rising",
    mask: [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      ".............###",
      ".............###",
      ".........#######",
      "...#############",
      "...#############",
      "...#############",
      "################",
      "################",
      "################"
    ]
  },
  {
    figmaNode: "approved:25",
    source: "approved",
    family: "hanging",
    mask: [
      "............####",
      "............####",
      "............####",
      "......##########",
      "......##########",
      "################",
      "################",
      "############....",
      "############....",
      "############....",
      "######..........",
      "######..........",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:26",
    source: "approved",
    family: "rising",
    mask: [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "............####",
      "............####",
      "......##########",
      "......##########",
      "......##########",
      "......##########",
      "############....",
      "############....",
      "############...."
    ]
  },
  {
    figmaNode: "approved:27",
    source: "approved",
    family: "hanging",
    mask: [
      "............####",
      "............####",
      "........########",
      "........########",
      "........########",
      "....########....",
      "....########....",
      "....########....",
      "############....",
      "####............",
      "####............",
      "####............",
      "####............",
      "####............",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:28",
    source: "approved",
    family: "rising",
    mask: [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "..........######",
      "..........######",
      "..........######",
      "......##########",
      "......##########",
      "......##########",
      "......##########",
      "################",
      "################",
      "################"
    ]
  },
  {
    figmaNode: "approved:29",
    source: "approved",
    family: "rising",
    mask: [
      "................",
      "................",
      "................",
      "................",
      "................",
      "............####",
      "............####",
      "............####",
      "............####",
      "........########",
      "........########",
      "....############",
      "....############",
      "....############",
      "################",
      "################"
    ]
  },
  {
    figmaNode: "approved:30",
    source: "approved",
    family: "rising",
    mask: [
      "....############",
      "....############",
      "....############",
      "....############",
      "....############",
      "....############",
      "..##############",
      "..##############",
      "..##############",
      "..##############",
      "..######........",
      "..######........",
      "##..............",
      "##..............",
      "##..............",
      "##.............."
    ]
  },
  {
    figmaNode: "approved:31",
    source: "approved",
    family: "mountain",
    mask: [
      "............###.",
      "............###.",
      "............###.",
      "............###.",
      "........#######.",
      "........#######.",
      "........#######.",
      "........####....",
      "........####....",
      "....########....",
      "....########....",
      "....####........",
      "....####........",
      "....####........",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:32",
    source: "approved",
    family: "rising",
    mask: [
      "............####",
      "............####",
      "##........######",
      "##........######",
      "######....######",
      "######....######",
      "######....######",
      "######....######",
      "################",
      "################",
      "############....",
      "############....",
      "..########......",
      "..########......",
      "......####......",
      "......####......"
    ]
  },
  {
    figmaNode: "approved:33",
    source: "approved",
    family: "rising",
    mask: [
      "............####",
      "............####",
      "####......######",
      "####......######",
      "####......######",
      "####......######",
      "######....######",
      "######....######",
      "############....",
      "############....",
      "....######......",
      "....######......",
      "......####......",
      "......####......",
      "......####......",
      "......####......"
    ]
  },
  {
    figmaNode: "approved:34",
    source: "approved",
    family: "mountain",
    mask: [
      "............##..",
      "............##..",
      "............##..",
      "............##..",
      "........######..",
      "........######..",
      "........####....",
      "........####....",
      "....########....",
      "....########....",
      "....####........",
      "....####........",
      "....####........",
      "....####........",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:35",
    source: "approved",
    family: "hanging",
    mask: [
      "..........######",
      "..........######",
      "....############",
      "....############",
      "....############",
      "....############",
      "##########......",
      "##########......",
      "##########......",
      "##########......",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:36",
    source: "approved",
    family: "rising",
    mask: [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "............####",
      "............####",
      "......##########",
      "......##########",
      "################",
      "################",
      "################",
      "################"
    ]
  },
  {
    figmaNode: "approved:37",
    source: "approved",
    family: "hanging",
    mask: [
      "..........######",
      "..........######",
      "......##########",
      "......##########",
      "##########......",
      "##########......",
      "##########......",
      "##########......",
      "######..........",
      "######..........",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:38",
    source: "approved",
    family: "rising",
    mask: [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "............####",
      "............####",
      "......##########",
      "......##########",
      "......##########",
      "......##########",
      "################",
      "################"
    ]
  },
  {
    figmaNode: "approved:39",
    source: "approved",
    family: "hanging",
    mask: [
      "........########",
      "........########",
      "........########",
      "........########",
      "....############",
      "....############",
      "################",
      "################",
      "########........",
      "########........",
      "####............",
      "####............",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:40",
    source: "approved",
    family: "rising",
    mask: [
      "................",
      "................",
      "................",
      "................",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "......##########",
      "......##########",
      "......##########",
      "......##########",
      "################",
      "################"
    ]
  },
  {
    figmaNode: "approved:41",
    source: "approved",
    family: "rising",
    mask: [
      "................",
      "................",
      "................",
      "................",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "....############",
      "....############",
      "....############",
      "....############",
      "....############",
      "....############",
      "################",
      "################"
    ]
  },
  {
    figmaNode: "approved:42",
    source: "approved",
    family: "hanging",
    mask: [
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "....############",
      "....############",
      "....############",
      "....############",
      "##########......",
      "##########......",
      "##########......",
      "##########......",
      "####............",
      "####............",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:43",
    source: "approved",
    family: "hanging",
    mask: [
      "........########",
      "........########",
      "....############",
      "....############",
      "################",
      "################",
      "############....",
      "############....",
      "####............",
      "####............",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:44",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      ".......########.",
      ".......########.",
      ".......########.",
      ".......########.",
      ".......########.",
      ".......########.",
      ".......########.",
      "....###########.",
      "....###########.",
      "....###########.",
      "....###.........",
      "....###.........",
      "....###.........",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:45",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      "..........####..",
      "..........####..",
      "....##....####..",
      "....##....####..",
      "....##########..",
      "....##########..",
      "......########..",
      "......########..",
      "......######....",
      "......######....",
      "..........##....",
      "..........##....",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:46",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      ".........#######",
      ".........#######",
      ".........#######",
      ".........#######",
      "........########",
      "........########",
      "........########",
      "........########",
      "......#########.",
      "......#########.",
      "......##........",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:47",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      "........########",
      "........########",
      ".......#########",
      ".......#########",
      ".......#########",
      ".......#######..",
      ".......#######..",
      ".......#######..",
      ".......#######..",
      ".......#######..",
      "......#######...",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:48",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      ".........#######",
      ".........#######",
      ".........#######",
      "........########",
      "........#######.",
      ".......########.",
      ".......#######..",
      ".......#######..",
      "......########..",
      "......#.........",
      "......#.........",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:49",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      ".........#######",
      ".........#######",
      ".........#######",
      ".........#######",
      "......####......",
      "......####......",
      "......###.......",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:50",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      "...........#####",
      "...........#####",
      ".......#########",
      ".......#########",
      ".......#########",
      ".......#########",
      ".......#########",
      ".......#########",
      "......##########",
      "......#####.....",
      "......####......",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:51",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      "..............##",
      "..............##",
      ".......#########",
      ".......#########",
      ".......#########",
      ".......#########",
      ".......#########",
      ".......#########",
      ".......#######..",
      "......########..",
      "......#######...",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:52",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      "........########",
      "........########",
      "........########",
      "........########",
      "........########",
      "........########",
      ".......#########",
      ".......#######..",
      ".......#######..",
      "......#####.....",
      "......#####.....",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:53",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      ".........#######",
      ".........#######",
      ".........#######",
      "........########",
      ".......#########",
      ".......#########",
      ".......#########",
      ".......#########",
      ".......#########",
      "......##########",
      "......#######...",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:54",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      ".........#######",
      ".........#######",
      "........########",
      "........########",
      "........########",
      "........#######.",
      "........#######.",
      "........#######.",
      "........#######.",
      "......#########.",
      "......########..",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:55",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      "...........#####",
      "...........#####",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "..........######",
      "......#####.....",
      "......#####.....",
      "......####......",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:56",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      ".........#######",
      ".........#######",
      ".........#######",
      ".........#######",
      ".........#######",
      ".........#######",
      "........########",
      "........########",
      "......#########.",
      "......##........",
      "......##........",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:57",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      "........########",
      "........########",
      "........########",
      "........########",
      ".......#########",
      ".......#########",
      ".......#######..",
      ".......#######..",
      "......###.......",
      "......###.......",
      "......###.......",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:58",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      "........########",
      "........########",
      "........########",
      "........########",
      ".......#########",
      ".......#########",
      ".......#######..",
      ".......#######..",
      ".......#######..",
      ".......#######..",
      "......##........",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:59",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      "..............##",
      "..............##",
      "..............##",
      "..............##",
      ".......#########",
      ".......#########",
      ".......#########",
      ".......#######..",
      "......########..",
      "......########..",
      "......#######...",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:60",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      "...............#",
      "...............#",
      "...............#",
      "........########",
      "........#######.",
      "........#######.",
      "........#######.",
      ".......########.",
      ".......########.",
      "......########..",
      "......#.........",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:61",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      "...............#",
      "...............#",
      "...............#",
      "........########",
      ".......########.",
      ".......########.",
      ".......#######..",
      ".......#######..",
      ".......#######..",
      ".......#######..",
      "......###.......",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:62",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      "...........#####",
      "...........#####",
      "...........#####",
      "...........#####",
      ".......#########",
      ".......#########",
      ".......####.....",
      ".......####.....",
      "......#####.....",
      "......#####.....",
      "......####......",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:63",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      "...............#",
      "........#######.",
      ".......########.",
      ".......########.",
      ".......########.",
      ".......#######..",
      ".......#######..",
      ".......#######..",
      "......########..",
      "......########..",
      "......##........",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:64",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      ".......#.#######",
      ".......#########",
      ".......#########",
      ".......#########",
      ".......#########",
      ".......#########",
      ".......#########",
      ".......#########",
      "......#.#######.",
      "......#.#######.",
      "......#.#######.",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:65",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      "..............##",
      "..............##",
      ".......#######..",
      ".......#######..",
      ".......#######..",
      ".......#######..",
      ".......#######..",
      ".......#######..",
      ".......#######..",
      ".......#######..",
      "......#######...",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  },
  {
    figmaNode: "approved:66",
    source: "approved",
    family: "mountain",
    set: 2,
    mask: [
      "..............##",
      "..............##",
      "..............##",
      "..............##",
      ".......#######..",
      ".......#######..",
      ".......#######..",
      ".......#######..",
      ".......#######..",
      ".......#######..",
      "......#######...",
      "................",
      "................",
      "................",
      "................",
      "................"
    ]
  }
];

// packages/core/src/referencePatterns.ts
var REFERENCE_SIZE = 16;
var HANGING = /* @__PURE__ */ new Set([
  "71:1986",
  "71:892",
  "71:2772",
  "71:261",
  // in use
  "18:1855",
  "18:1877",
  "18:1886",
  "387:871",
  "18:936",
  "18:985",
  "17:407",
  "17:436",
  "386:272",
  "386:188",
  "6:833",
  "6:682",
  "10:4568",
  "10:4596",
  "14:611",
  "10:4648",
  "6:959",
  "668:199",
  "6:878",
  "18:1034"
]);
var MOUNTAIN = /* @__PURE__ */ new Set(["71:635", "71:957", "14:630"]);
var ACCENT = /* @__PURE__ */ new Set(["111:451", "111:510"]);
var FLAT_BELOW = 12;
var STEEP_FROM = 30;
var SLOPE_TREND_BAND = {
  flat: [-FLAT_BELOW, FLAT_BELOW],
  half: [FLAT_BELOW, STEEP_FROM],
  "75": [STEEP_FROM, 90]
};
function trendDegrees(points) {
  const n = points.length;
  if (n < 2) return null;
  const mx = points.reduce((s, p) => s + p[0], 0) / n;
  const my = points.reduce((s, p) => s + p[1], 0) / n;
  let sxx = 0;
  let sxy = 0;
  for (const [x, y] of points) {
    sxx += (x - mx) ** 2;
    sxy += (x - mx) * (y - my);
  }
  if (sxx === 0) return sxy > 0 ? 90 : sxy < 0 ? -90 : 0;
  return Math.atan(sxy / sxx) * 180 / Math.PI;
}
function maskTrend(mask) {
  const pts = [];
  mask.forEach(
    (row, r2) => [...row].forEach((ch, c) => {
      if (ch === "#") pts.push([c + 0.5, mask.length - r2 - 0.5]);
    })
  );
  return trendDegrees(pts) ?? 0;
}
function cellPoints(blocks, grid) {
  const seen = /* @__PURE__ */ new Set();
  const pts = [];
  for (const b of blocks) {
    for (let c = b.col; c < b.col + b.w; c++) {
      for (let r2 = b.row; r2 < b.row + b.h; r2++) {
        const k = r2 * grid.cols + c;
        if (seen.has(k)) continue;
        seen.add(k);
        pts.push([c + 0.5, grid.rows - r2 - 0.5]);
      }
    }
  }
  return pts;
}
function cellTrend(blocks, grid) {
  const sx = grid.cols > grid.rows ? grid.rows / grid.cols : 1;
  return trendDegrees(cellPoints(blocks, grid).map(([x, y]) => [x * sx, y]));
}
function staircaseSteps(blocks, grid) {
  const tops = Array.from({ length: grid.cols }, () => -1);
  for (const b of blocks) {
    for (let c = Math.max(0, b.col); c < Math.min(grid.cols, b.col + b.w); c++) {
      if (tops[c] === -1 || b.row < tops[c]) tops[c] = b.row;
    }
  }
  let steps = 0;
  for (let c = 1; c < grid.cols; c++) if (tops[c] !== tops[c - 1]) steps++;
  return steps;
}
var MAX_STEPS_PER_16 = 7;
var TREND_MEASURABLE_FROM = 8;
function keepsGrowth(blocks, grid, slope) {
  const trend = trendDegrees(blocks.map((b) => [b.col + b.w / 2, grid.rows - b.row - b.h / 2]));
  return trend === null || (slope === "flat" ? trend > -FLAT_BELOW : trend > 0);
}
function slopeShapeProblem(blocks, grid, slope) {
  const measurable = Math.min(grid.cols, grid.rows) >= TREND_MEASURABLE_FROM;
  if (slope === "75" && measurable && blocks.length >= 2 && (cellTrend(blocks, grid) ?? 90) < STEEP_FROM) return "shallow75";
  const maxSteps = Math.max(MAX_STEPS_PER_16, Math.round(MAX_STEPS_PER_16 * grid.cols / REFERENCE_SIZE));
  if (staircaseSteps(blocks, grid) > maxSteps) return "steps";
  return null;
}
function classifyReferenceSlope(mask, family) {
  if (family === "accent") return null;
  const trend = maskTrend(mask);
  if (trend < FLAT_BELOW) return "flat";
  if (trend < STEEP_FROM || family === "mountain" || mask[0][mask[0].length - 1] !== "#") return "half";
  return "75";
}
function toReferencePattern({ figmaNode, source, mask, family: given, slope: chosen, set = 1 }) {
  const family = given ?? (ACCENT.has(figmaNode) ? "accent" : MOUNTAIN.has(figmaNode) ? "mountain" : HANGING.has(figmaNode) ? "hanging" : "rising");
  return { figmaNode, source, mask, family, slope: chosen ?? classifyReferenceSlope(mask, family), set };
}
var REFERENCE_PATTERNS = REFERENCE_PATTERN_MASKS.map(toReferencePattern);
var AREA_RESAMPLE_SET = 3;
var LATEST_REFERENCE_SET = 3;
var UNRELEASED_REFERENCE_SET = 4;
function rollReferenceSet(current2) {
  return Math.max(LATEST_REFERENCE_SET, current2 ?? 0);
}
function usesSet4Rules(referenceSet) {
  return (referenceSet ?? 1) >= UNRELEASED_REFERENCE_SET;
}
var activePatterns = REFERENCE_PATTERNS;
function withReferencePatterns(patterns, fn) {
  const before = activePatterns;
  activePatterns = patterns;
  try {
    return fn();
  } finally {
    activePatterns = before;
  }
}
function referencePatternsFor(set) {
  const n = set ?? 1;
  return n >= UNRELEASED_REFERENCE_SET ? activePatterns : activePatterns.filter((p) => p.set <= n);
}
function patternMask(blocks, grid) {
  const n = REFERENCE_SIZE;
  const out = new Array(n * n).fill(false);
  const span = (start, len, side) => [
    Math.max(0, Math.ceil(start * n / side - 0.5)),
    Math.min(n, Math.ceil((start + len) * n / side - 0.5))
  ];
  for (const b of blocks) {
    const [c0, c1] = span(b.col, b.w, grid.cols);
    const [r0, r1] = span(b.row, b.h, grid.rows);
    for (let r2 = r0; r2 < r1; r2++) for (let c = c0; c < c1; c++) out[r2 * n + c] = true;
  }
  return out;
}
function maskOverlap(a, b) {
  let inter = 0;
  let union = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] && b[i]) inter++;
    if (a[i] || b[i]) union++;
  }
  return union === 0 ? 1 : inter / union;
}
var REF_CELLS = /* @__PURE__ */ new Map();
function refCells(ref) {
  let cells = REF_CELLS.get(ref);
  if (!cells) {
    cells = [];
    const flat = ref.mask.join("");
    for (let i = 0; i < flat.length; i++) if (flat[i] === "#") cells.push(i);
    REF_CELLS.set(ref, cells);
  }
  return cells;
}
function patternSimilarity(blocks, grid, filter = {}) {
  const cells = patternMask(blocks, grid);
  const covered = cells.filter(Boolean).length;
  let best = { iou: 0, match: null };
  for (const ref of filter.set === void 0 ? activePatterns : referencePatternsFor(filter.set)) {
    if (filter.family && ref.family !== filter.family) continue;
    if (filter.slope && ref.slope !== null && ref.slope !== filter.slope) continue;
    const own = refCells(ref);
    let inter = 0;
    for (const i of own) if (cells[i]) inter++;
    const iou = inter / (covered + own.length - inter);
    if (iou > best.iou) best = { iou, match: ref };
  }
  return best;
}

// packages/core/src/blockSettingRanges.ts
var BLOCK_SETTING_RANGES = {
  "referenceSet": 3,
  "densities": {
    "coarse": {
      "copies": 319,
      "smallestBlockArea": {
        "min": 1,
        "max": 3,
        "measuredMin": 1
      },
      "blockProportion": {
        "min": 1.5,
        "max": 4
      }
    },
    "medium": {
      "copies": 320,
      "smallestBlockArea": {
        "min": 1,
        "max": 8,
        "measuredMin": 1
      },
      "blockProportion": {
        "min": 1.3333,
        "max": 8
      }
    },
    "fine": {
      "copies": 320,
      "smallestBlockArea": {
        "min": 1,
        "max": 14,
        "measuredMin": 1
      },
      "blockProportion": {
        "min": 1.3333,
        "max": 14
      }
    },
    "extra-fine": {
      "copies": 320,
      "smallestBlockArea": {
        "min": 12,
        "max": 56,
        "measuredMin": 4
      },
      "blockProportion": {
        "min": 1.3333,
        "max": 14
      }
    }
  }
};

// packages/core/src/signedBlockThresholds.ts
var SIGNED_BLOCK_THRESHOLDS = {
  4: {
    "extra-fine": { minBlockArea: 12 }
  }
};

// packages/core/src/blockThresholds.ts
var TABLE = SIGNED_BLOCK_THRESHOLDS;
function blockThresholdsFor(referenceSet, density) {
  return TABLE[referenceSet ?? 1]?.[density];
}
function blockSettingRangesFor(density) {
  return BLOCK_SETTING_RANGES.densities[density];
}

// packages/core/src/shapeSettingRanges.ts
var SHAPE_SETTING_RANGES = {
  "referenceSet": 3,
  "rows": [
    {
      "slope": "flat",
      "family": "rising",
      "patterns": 12,
      "settings": {
        "startHeight": {
          "min": 0.1875,
          "max": 0.875,
          "default": 0.4063
        },
        "endHeight": {
          "min": 0.3125,
          "max": 1,
          "default": 0.5313
        },
        "curve": {
          "min": -0.1953,
          "max": 0.0875,
          "default": -0.0234
        },
        "roughness": {
          "min": 0,
          "max": 0.075,
          "default": 93e-4
        },
        "dipShare": {
          "min": 0,
          "max": 0.5,
          "default": 0
        },
        "dipDepth": {
          "min": 0,
          "max": 0.25,
          "default": 0
        },
        "columns": {
          "min": 3,
          "max": 6,
          "default": 4
        },
        "columnUnevenness": {
          "min": 0.125,
          "max": 0.6374,
          "default": 0.3062
        },
        "bandThickness": {
          "min": 0.4375,
          "max": 0.75,
          "default": 0.5
        }
      }
    },
    {
      "slope": "half",
      "family": "rising",
      "patterns": 26,
      "settings": {
        "startHeight": {
          "min": 0.125,
          "max": 0.875,
          "default": 0.375
        },
        "endHeight": {
          "min": 0.25,
          "max": 1,
          "default": 1
        },
        "curve": {
          "min": -0.2187,
          "max": 0.2969,
          "default": 0
        },
        "roughness": {
          "min": 0,
          "max": 0.2083,
          "default": 0.0455
        },
        "dipShare": {
          "min": 0,
          "max": 0.5,
          "default": 0
        },
        "dipDepth": {
          "min": 0,
          "max": 0.25,
          "default": 0
        },
        "columns": {
          "min": 3,
          "max": 10,
          "default": 4
        },
        "columnUnevenness": {
          "min": 0,
          "max": 0.8244,
          "default": 0.3062
        },
        "bandThickness": {
          "min": 0.375,
          "max": 0.875,
          "default": 0.6875
        }
      }
    },
    {
      "slope": "75",
      "family": "rising",
      "patterns": 11,
      "settings": {
        "startHeight": {
          "min": 0.0625,
          "max": 0.375,
          "default": 0.25
        },
        "endHeight": {
          "min": 1,
          "max": 1,
          "default": 1
        },
        "curve": {
          "min": -0.0859,
          "max": 0.1406,
          "default": 0.0391
        },
        "roughness": {
          "min": 0.0227,
          "max": 0.0885,
          "default": 0.0417
        },
        "dipShare": {
          "min": 0,
          "max": 0.2,
          "default": 0
        },
        "dipDepth": {
          "min": 0,
          "max": 0.125,
          "default": 0
        },
        "columns": {
          "min": 3,
          "max": 8,
          "default": 4
        },
        "columnUnevenness": {
          "min": 0,
          "max": 0.75,
          "default": 0.3536
        },
        "bandThickness": {
          "min": 0.4375,
          "max": 0.6875,
          "default": 0.625
        }
      }
    },
    {
      "slope": "flat",
      "family": "hanging",
      "patterns": 9,
      "settings": {
        "startHeight": {
          "min": 0.625,
          "max": 1,
          "default": 1
        },
        "endHeight": {
          "min": 1,
          "max": 1,
          "default": 1
        },
        "curve": {
          "min": -0.0781,
          "max": 0.0234,
          "default": 0
        },
        "roughness": {
          "min": 0,
          "max": 0.0329,
          "default": 0
        },
        "dipShare": {
          "min": 0,
          "max": 0.3333,
          "default": 0
        },
        "dipDepth": {
          "min": 0,
          "max": 0.1875,
          "default": 0
        },
        "columns": {
          "min": 3,
          "max": 8,
          "default": 5
        },
        "columnUnevenness": {
          "min": 0,
          "max": 0.5796,
          "default": 0.3062
        },
        "bandThickness": {
          "min": 0.5,
          "max": 0.75,
          "default": 0.625
        },
        "lift": {
          "min": 0.25,
          "max": 0.5,
          "default": 0.375
        }
      }
    },
    {
      "slope": "half",
      "family": "hanging",
      "patterns": 20,
      "settings": {
        "startHeight": {
          "min": 0.375,
          "max": 0.875,
          "default": 0.6563
        },
        "endHeight": {
          "min": 1,
          "max": 1,
          "default": 1
        },
        "curve": {
          "min": -0.1719,
          "max": 0.1406,
          "default": -78e-4
        },
        "roughness": {
          "min": 0,
          "max": 0.2375,
          "default": 0.025
        },
        "dipShare": {
          "min": 0,
          "max": 0.5,
          "default": 0
        },
        "dipDepth": {
          "min": 0,
          "max": 0.25,
          "default": 0
        },
        "columns": {
          "min": 3,
          "max": 10,
          "default": 4
        },
        "columnUnevenness": {
          "min": 0,
          "max": 0.6374,
          "default": 0.1768
        },
        "bandThickness": {
          "min": 0.375,
          "max": 0.75,
          "default": 0.5
        },
        "lift": {
          "min": 0.125,
          "max": 0.4375,
          "default": 0.25
        }
      }
    },
    {
      "slope": "75",
      "family": "hanging",
      "patterns": 16,
      "settings": {
        "startHeight": {
          "min": 0.25,
          "max": 0.5,
          "default": 0.3125
        },
        "endHeight": {
          "min": 1,
          "max": 1,
          "default": 1
        },
        "curve": {
          "min": -0.0781,
          "max": 0.1016,
          "default": -78e-4
        },
        "roughness": {
          "min": 0,
          "max": 0.1534,
          "default": 0.0422
        },
        "dipShare": {
          "min": 0,
          "max": 0,
          "default": 0
        },
        "dipDepth": {
          "min": 0,
          "max": 0,
          "default": 0
        },
        "columns": {
          "min": 3,
          "max": 6,
          "default": 3
        },
        "columnUnevenness": {
          "min": 0,
          "max": 0.5154,
          "default": 0.1768
        },
        "bandThickness": {
          "min": 0.375,
          "max": 0.625,
          "default": 0.5
        },
        "lift": {
          "min": 0.125,
          "max": 0.25,
          "default": 0.125
        }
      }
    },
    {
      "slope": "flat",
      "family": "mountain",
      "patterns": 4,
      "settings": {
        "startHeight": {
          "min": 0.5,
          "max": 0.875,
          "default": 0.8438
        },
        "endHeight": {
          "min": 0.875,
          "max": 1,
          "default": 1
        },
        "curve": {
          "min": -0.0625,
          "max": 0.1938,
          "default": -0.0317
        },
        "roughness": {
          "min": 0,
          "max": 0,
          "default": 0
        },
        "dipShare": {
          "min": 0.5,
          "max": 1,
          "default": 0.5
        },
        "dipDepth": {
          "min": 0.0625,
          "max": 0.125,
          "default": 0.0938
        },
        "columns": {
          "min": 4,
          "max": 6,
          "default": 5
        },
        "columnUnevenness": {
          "min": 0,
          "max": 1,
          "default": 0.3433
        },
        "bandThickness": {
          "min": 0.625,
          "max": 0.75,
          "default": 0.7188
        },
        "lift": {
          "min": 0.1875,
          "max": 0.375,
          "default": 0.2813
        },
        "insetLeft": {
          "min": 0.25,
          "max": 0.375,
          "default": 0.25
        },
        "insetRight": {
          "min": 0,
          "max": 0.125,
          "default": 0.0313
        }
      }
    },
    {
      "slope": "half",
      "family": "mountain",
      "patterns": 24,
      "settings": {
        "startHeight": {
          "min": 0.375,
          "max": 0.5625,
          "default": 0.5
        },
        "endHeight": {
          "min": 1,
          "max": 1,
          "default": 1
        },
        "curve": {
          "min": -0.05,
          "max": 0.2375,
          "default": 0.1188
        },
        "roughness": {
          "min": 0,
          "max": 0.3864,
          "default": 0.0831
        },
        "dipShare": {
          "min": 0,
          "max": 0,
          "default": 0
        },
        "dipDepth": {
          "min": 0,
          "max": 0,
          "default": 0
        },
        "columns": {
          "min": 2,
          "max": 6,
          "default": 4
        },
        "columnUnevenness": {
          "min": 0.1286,
          "max": 1,
          "default": 0.7746
        },
        "bandThickness": {
          "min": 0.375,
          "max": 0.6875,
          "default": 0.5625
        },
        "lift": {
          "min": 0,
          "max": 0.3125,
          "default": 0.3125
        },
        "insetLeft": {
          "min": 0.25,
          "max": 0.375,
          "default": 0.375
        },
        "insetRight": {
          "min": 0,
          "max": 0.125,
          "default": 0
        }
      }
    }
  ]
};

// packages/core/src/set4Rules.ts
function set4RuleProblem({ blocks, grid, slope, density, referenceSet, family, keeperCopy }) {
  const signed = blockRulesFor({ referenceSet }, density);
  if (!signed) return null;
  if (blockRuleProblem(blocks, signed)) return "smallBlock";
  if (keeperCopy || Math.min(grid.cols, grid.rows) < TREND_MEASURABLE_FROM) return null;
  const trend = cellTrend(blocks, grid);
  if (trend === null) return null;
  const [min, max] = SLOPE_TREND_BAND[slope];
  const softUpper = family === "mountain" && slope !== "flat";
  return trend < min || !softUpper && trend > max ? "trend" : null;
}

// packages/core/src/shapeSettings.ts
var ALL = ["rising", "hanging", "mountain"];
var SHAPE_SETTINGS = [
  {
    label: "Start height",
    keys: ["startHeight"],
    families: ALL,
    definition: "Height of the top of the first column of the Mass, as a share of the Page height."
  },
  {
    label: "End height",
    keys: ["endHeight"],
    families: ALL,
    definition: "Height of the top of the last column of the Mass, as a share of the Page height (75% fixes it at 1)."
  },
  {
    label: "Curve",
    keys: ["curve"],
    families: ALL,
    definition: "Mean height of the top profile above the straight line from the first to the last column, as a share of the Page height: positive climbs early, negative late, 0 is straight. For a profile start + (end - start) * t^g it is (end - start) * (1 / (g + 1) - 1 / 2)."
  },
  {
    label: "Roughness",
    keys: ["roughness"],
    families: ALL,
    definition: "Mean distance, as a share of the Page height, of each inner step from the line through the steps on either side of it (at its position). Dips and their neighbours are left out. 0 is a clean staircase."
  },
  {
    label: "Dip",
    keys: ["dipShare", "dipDepth"],
    families: ALL,
    definition: "A step lower than the steps on both sides. Chance: dips as a share of inner steps. Depth: how far the deepest dip is below its lower neighbour, as a share of the Page height (0 with no dip)."
  },
  {
    label: "Columns",
    keys: ["columns", "columnUnevenness"],
    families: ALL,
    definition: "Count: columns of the Mass, where a column is a run of cell columns with the same top and bottom (a count of steps, the same on every Grid). Unevenness: the standard deviation of the column widths over their mean (0 when all are equal)."
  },
  {
    label: "Band thickness",
    keys: ["bandThickness"],
    families: ALL,
    definition: "Thickness of the thickest column (its top to its bottom), as a share of the Page height. A Solid is as thick as it is tall."
  },
  {
    label: "Lift",
    keys: ["lift"],
    families: ["hanging", "mountain"],
    definition: "Gap between the bottom edge of the Page and the lowest column of the Mass, as a share of the Page height."
  },
  {
    label: "Inset",
    keys: ["insetLeft", "insetRight"],
    families: ["mountain"],
    definition: "Gap between the left (right) edge of the Page and the first (last) column of the Mass, as a share of the Page width."
  }
];
var round = (n) => Math.round(n * 1e4) / 1e4;
var mean = (xs) => xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;
function measureShape(mask) {
  const rows = mask.length;
  const width = mask[0]?.length ?? 0;
  const cols = [];
  for (let c = 0; c < width; c++) {
    let top = -1;
    let bottom = -1;
    for (let r2 = 0; r2 < rows; r2++) {
      if (mask[r2][c] !== "#") continue;
      if (top < 0) top = r2;
      bottom = r2;
    }
    cols.push(top < 0 ? null : { c, top, bottom });
  }
  const used = cols.filter((x) => x !== null);
  if (used.length === 0) {
    return {
      startHeight: 0,
      endHeight: 0,
      curve: 0,
      roughness: 0,
      dipShare: 0,
      dipDepth: 0,
      columns: 0,
      columnUnevenness: 0,
      bandThickness: 0,
      lift: 0,
      insetLeft: 0,
      insetRight: 0
    };
  }
  const first = used[0];
  const last = used[used.length - 1];
  const height = (x) => (rows - x.top) / rows;
  const startHeight = height(first);
  const endHeight = height(last);
  const lift = Math.min(...used.map((x) => (rows - 1 - x.bottom) / rows));
  const bandThickness = Math.max(...used.map((x) => (x.bottom - x.top + 1) / rows));
  const spanC = last.c - first.c;
  const curve = spanC === 0 ? 0 : mean(used.map((x) => height(x) - (startHeight + (endHeight - startHeight) * (x.c - first.c) / spanC)));
  const runs = [];
  for (const x of used) {
    const run = runs[runs.length - 1];
    if (run && run.h === height(x)) run.to = x.c;
    else runs.push({ from: x.c, to: x.c, h: height(x) });
  }
  const widths = [];
  let prev = null;
  for (const x of used) {
    if (prev && prev.top === x.top && prev.bottom === x.bottom && prev.c === x.c - 1) widths[widths.length - 1]++;
    else widths.push(1);
    prev = x;
  }
  const mw = mean(widths);
  const columnUnevenness = widths.length < 2 ? 0 : Math.sqrt(mean(widths.map((w) => (w - mw) ** 2))) / mw;
  const isDip = runs.map((r2, i) => i > 0 && i < runs.length - 1 && r2.h < runs[i - 1].h && r2.h < runs[i + 1].h);
  const inner = Math.max(0, runs.length - 2);
  const dipShare = inner === 0 ? 0 : isDip.filter(Boolean).length / inner;
  const dipDepth = Math.max(
    0,
    ...runs.map((r2, i) => isDip[i] ? Math.min(runs[i - 1].h, runs[i + 1].h) - r2.h : 0)
  );
  const centre = (r2) => (r2.from + r2.to) / 2;
  const residuals = [];
  for (let i = 1; i < runs.length - 1; i++) {
    if (isDip[i - 1] || isDip[i] || isDip[i + 1]) continue;
    const a = runs[i - 1];
    const b = runs[i + 1];
    const t = (centre(runs[i]) - centre(a)) / (centre(b) - centre(a));
    residuals.push(Math.abs(runs[i].h - (a.h + (b.h - a.h) * t)));
  }
  return {
    startHeight: round(startHeight),
    endHeight: round(endHeight),
    curve: round(curve),
    roughness: round(mean(residuals)),
    dipShare: round(dipShare),
    dipDepth: round(dipDepth),
    columns: widths.length,
    columnUnevenness: round(columnUnevenness),
    bandThickness: round(bandThickness),
    lift: round(lift),
    insetLeft: round(first.c / width),
    insetRight: round((width - 1 - last.c) / width)
  };
}
var SLOPES = ["flat", "half", "75"];
var median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return round(s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2);
};
function keeperIsOnBrand(keeper) {
  if (keeper.slope === null) return false;
  const grid = { cols: REFERENCE_SIZE, rows: REFERENCE_SIZE, cellW: 1, cellH: 1 };
  const blocks = [];
  keeper.mask.forEach(
    (row, r2) => [...row].forEach((ch, c) => {
      if (ch === "#") blocks.push({ id: `k-${r2}-${c}`, col: c, row: r2, w: 1, h: 1, tint: 0 });
    })
  );
  const family = keeper.family === "accent" ? void 0 : keeper.family;
  return set4RuleProblem({ blocks, grid, slope: keeper.slope, density: "fine", referenceSet: UNRELEASED_REFERENCE_SET, family }) !== "trend" && slopeShapeProblem(blocks, grid, keeper.slope) === null;
}
function measuredReferencePatterns() {
  const released = referencePatternsFor(LATEST_REFERENCE_SET);
  const keepers = referencePatternsFor(UNRELEASED_REFERENCE_SET).filter(
    (p) => p.source === "keeper" && p.set > LATEST_REFERENCE_SET && keeperIsOnBrand(p)
  );
  return keepers.length === 0 ? { patterns: released, referenceSet: LATEST_REFERENCE_SET } : { patterns: [...released, ...keepers], referenceSet: UNRELEASED_REFERENCE_SET };
}
function measureShapeRanges(patterns, referenceSet) {
  const rows = [];
  for (const family of ALL) {
    for (const slope of SLOPES) {
      const group = patterns.filter((p) => p.family === family && p.slope === slope);
      if (group.length === 0) continue;
      const measures = group.map((p) => measureShape(p.mask));
      const settings = {};
      for (const def of SHAPE_SETTINGS) {
        if (!def.families.includes(family)) continue;
        for (const key of def.keys) {
          const values = measures.map((m) => m[key]);
          settings[key] = { min: Math.min(...values), max: Math.max(...values), default: median(values) };
        }
      }
      rows.push({ slope, family, patterns: group.length, settings });
    }
  }
  return { referenceSet, rows };
}
function shapeRangeFor(slope, family) {
  return SHAPE_SETTING_RANGES.rows.find((r2) => r2.slope === slope && r2.family === family);
}

// packages/core/src/cornerMeets.ts
function countCornerMeets(blocks) {
  const out = [];
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const p = cornerPoint(blocks[i], blocks[j]);
      if (p) out.push(p);
    }
  }
  return out;
}
function cornerPoint(a, b) {
  let col;
  if (a.col + a.w === b.col) col = b.col;
  else if (b.col + b.w === a.col) col = a.col;
  else return null;
  let row;
  if (a.row + a.h === b.row) row = b.row;
  else if (b.row + b.h === a.row) row = a.row;
  else return null;
  return { col, row };
}

// packages/core/src/formula.ts
var RISING_KEYS = [
  "startHeight",
  "endHeight",
  "curve",
  "roughness",
  "dipShare",
  "dipDepth",
  "columns",
  "columnUnevenness",
  "bandThickness"
];
var LIFTED_KEYS = ["lift", "insetLeft", "insetRight"];
var DEFAULT_VARIATION = 50;
function blockRulesFor(params, density) {
  if (!usesSet4Rules(params.referenceSet)) return null;
  const signed = density ? blockThresholdsFor(params.referenceSet, density)?.minBlockArea : void 0;
  return {
    minArea: params.smallestBlock ?? signed ?? 0,
    ...params.blockProportion !== void 0 ? { maxRatio: params.blockProportion } : {}
  };
}
function scaledBlockRules(rules, factor) {
  return { ...rules, minArea: Math.ceil(rules.minArea / factor) };
}
function blockRuleProblem(blocks, rules) {
  for (const b of blocks) {
    if (b.w * b.h < rules.minArea) return "smallBlock";
    if (rules.maxRatio !== void 0 && Math.max(b.w / b.h, b.h / b.w) > rules.maxRatio + 1e-9) return "proportion";
  }
  return null;
}
var clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
function sampleSettings(row, given, variation, rng) {
  const out = {};
  for (const key of [...RISING_KEYS, ...LIFTED_KEYS]) {
    const range = row.settings[key];
    if (!range) continue;
    const base = clamp(given[key] ?? range.default, range.min, range.max);
    if (variation > 0 && range.max > range.min) {
      const lo = base - variation * (base - range.min);
      const hi = base + variation * (range.max - base);
      out[key] = lo + (hi - lo) * rng();
    } else out[key] = base;
  }
  return out;
}
function drawNoise(n, variation, rng) {
  const unit = () => Array.from({ length: n }, () => variation > 0 ? rng() * 2 - 1 : 0);
  return { width: unit(), rough: unit(), dip: unit() };
}
function apportion(raw, total) {
  const sum = raw.reduce((a, b) => a + b, 0);
  const exact = raw.map((r2) => r2 / sum * total);
  const out = exact.map((e) => Math.max(1, Math.floor(e)));
  let left = total - out.reduce((a, b) => a + b, 0);
  const order = exact.map((e, i) => ({ i, rem: e - Math.floor(e) })).sort((a, b) => b.rem - a.rem || a.i - b.i);
  for (let k = 0; left > 0; k = (k + 1) % order.length) {
    out[order[k].i]++;
    left--;
  }
  for (let k = 0; left < 0; k = (k + 1) % out.length) {
    let widest = 0;
    out.forEach((w, i) => w > out[widest] && (widest = i));
    if (out[widest] <= 1) break;
    out[widest]--;
    left++;
  }
  return out;
}
function resolveBand(s, sh) {
  if (sh.family === "rising") return { thick: s.bandThickness, lift: 0 };
  const rt = sh.row.settings.bandThickness;
  const rl = sh.row.settings.lift;
  const top = Math.min(1, s.endHeight);
  const first = Math.min(s.startHeight, top);
  let thick = s.bandThickness;
  let lift = s.lift ?? rl.default;
  const sum = lift + thick;
  if (sum <= top && sum >= first) return { thick, lift };
  const want = sum > top ? top : first;
  const give = sh.yields;
  const range = { bandThickness: rt, lift: rl };
  const values = { bandThickness: thick, lift };
  const keep = give === "bandThickness" ? "lift" : "bandThickness";
  values[give] = clamp(want - values[keep], range[give].min, range[give].max);
  values[keep] = clamp(want - values[give], range[keep].min, range[keep].max);
  thick = values.bandThickness;
  lift = values.lift;
  return { thick, lift };
}
function floorRows(s, grid, sh) {
  if (sh.family === "rising") return 0;
  return Math.min(grid.rows - 2, Math.max(sh.family === "hanging" ? 1 : 0, Math.round(resolveBand(s, sh).lift * grid.rows)));
}
function shapeSteps(s, noise, variation, grid, slope, sh) {
  const { cols, rows } = grid;
  const maxSteps = Math.max(7, Math.round(7 * cols / 16));
  const inset = (share) => Math.round((share ?? 0) * cols);
  const x0 = sh.family === "mountain" ? inset(s.insetLeft) : 0;
  const span = Math.max(Math.min(cols, 2), cols - x0 - (sh.family === "mountain" ? inset(s.insetRight) : 0));
  const n = clamp(Math.round(s.columns), 1, Math.min(span, maxSteps + 1));
  const alt = Array.from({ length: n }, (_, i) => i % 2 === 0 ? -1 : 1);
  const m = alt.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(alt.reduce((a, b) => a + (b - m) ** 2, 0) / n) || 1;
  const raw = alt.map((a, i) => Math.max(0.25, 1 + s.columnUnevenness * ((1 - variation) * ((a - m) / sd) + variation * Math.sqrt(3) * noise.width[i])));
  const widths = n === 1 ? [span] : apportion(raw, span);
  const starts = [];
  let x = x0;
  for (const w of widths) {
    starts.push(x);
    x += w;
  }
  const centres = widths.map((w, i) => starts[i] + w / 2);
  const t = centres.map((c) => n === 1 ? 1 : (c - centres[0]) / (centres[n - 1] - centres[0]));
  const d = s.endHeight - s.startHeight;
  const ratio = Math.abs(d) > 0.02 ? clamp(s.curve / d, -0.45, 0.45) : 0;
  const g = 1 / (ratio + 0.5) - 1;
  const h = t.map((tt) => s.startHeight + d * tt ** g);
  for (let i = 1; i < n - 1; i++) {
    const sign = (1 - variation) * (i % 2 === 0 ? 1 : -1) + variation * noise.rough[i];
    h[i] += s.roughness / 2 * sign;
  }
  const inner = Math.max(0, n - 2);
  const dips = Math.min(Math.floor((inner + 1) / 2), Math.round(s.dipShare * inner));
  const dipAt = /* @__PURE__ */ new Set();
  for (let k = 0; k < dips; k++) {
    const spacing = inner / dips;
    const j = 1 + Math.floor((k + 0.5) * spacing + variation * noise.dip[k] * (spacing / 2 - 0.5));
    dipAt.add(clamp(j, 1, n - 2));
  }
  for (const j of [...dipAt].sort((a, b) => a - b)) {
    if (dipAt.has(j - 1) || dipAt.has(j + 1)) continue;
    h[j] = Math.min(h[j - 1], h[j + 1]) - s.dipDepth;
  }
  const band = resolveBand(s, sh);
  const floor = floorRows(s, grid, sh);
  const top = h.map((v, i) => {
    if (i === n - 1 && (slope === "75" || sh.family === "hanging" && s.endHeight >= 1)) return rows;
    return clamp(Math.round(v * rows), floor + 1, rows);
  });
  const thick = Math.max(1, Math.round(band.thick * rows));
  const bottom = top.map((tp) => Math.max(floor, tp - thick));
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 1; i < n; i++) {
      if (Math.max(bottom[i], bottom[i - 1]) < Math.min(top[i], top[i - 1])) continue;
      if (top[i] > top[i - 1]) bottom[i] = Math.min(bottom[i], top[i - 1] - 1);
      else bottom[i - 1] = Math.min(bottom[i - 1], top[i] - 1);
    }
  }
  return standOnBottom(widths.map((w, i) => ({ x: starts[i], w, bottom: bottom[i], top: top[i] })), sh);
}
var stepHits = (st, h) => st.x < h.x1 && h.x0 < st.x + st.w && st.bottom < h.y1 && h.y0 < st.top;
function standOnBottom(steps, sh, hole) {
  if (sh.family !== "rising" || steps.length === 0) return steps;
  const reach = (st) => !hole || !stepHits({ ...st, bottom: 0, top: st.bottom }, hole);
  let low = -1;
  steps.forEach((st, i) => {
    if (reach(st) && (low < 0 || st.top < steps[low].top)) low = i;
  });
  if (low >= 0) steps[low].bottom = 0;
  return steps;
}
function cutAround(steps, hole) {
  const out = [];
  for (const st of steps) {
    if (!stepHits(st, hole)) {
      out.push(st);
      continue;
    }
    const end = st.x + st.w;
    if (st.x < hole.x0) out.push({ ...st, w: hole.x0 - st.x });
    const x = Math.max(st.x, hole.x0);
    const w = Math.min(end, hole.x1) - x;
    if (st.bottom < hole.y0) out.push({ x, w, bottom: st.bottom, top: Math.min(st.top, hole.y0) });
    if (st.top > hole.y1) out.push({ x, w, bottom: Math.max(st.bottom, hole.y1), top: st.top });
    if (end > hole.x1) out.push({ x: hole.x1, w: end - hole.x1, bottom: st.bottom, top: st.top });
  }
  return out.sort((a, b) => a.x - b.x || a.bottom - b.bottom);
}
function joinCover(steps, cover) {
  if (steps.some((st) => st.x <= cover.x1 && cover.x0 <= st.x + st.w && st.bottom <= cover.y1 && cover.y0 <= st.top)) return steps;
  const overlapX = (st) => st.x < cover.x1 && cover.x0 < st.x + st.w;
  const under = steps.filter((st) => overlapX(st) && st.top < cover.y0).sort((a, b) => b.top - a.top)[0];
  if (under) {
    under.top = cover.y0;
    return steps;
  }
  const over = steps.filter((st) => overlapX(st) && st.bottom > cover.y1).sort((a, b) => a.bottom - b.bottom)[0];
  if (over) over.bottom = cover.y1;
  return steps;
}
var MAX_SIDE = 8;
var stepBlocks = (steps, grid) => steps.map((st, i) => ({ id: `step-${i}`, col: st.x, row: grid.rows - st.top, w: st.w, h: st.top - st.bottom, tint: 0 }));
function pieceWidths(w, maxSide = MAX_SIDE) {
  const k = Math.ceil(w / maxSide);
  return Array.from({ length: k }, (_, i) => Math.floor(w * (i + 1) / k) - Math.floor(w * i / k));
}
function heightBounds(w, rules) {
  let lo = Math.max(1, Math.ceil(rules.minArea / w));
  let hi = rules.maxSide ?? MAX_SIDE;
  if (rules.maxRatio !== void 0) {
    lo = Math.max(lo, Math.ceil(w / rules.maxRatio - 1e-9));
    hi = Math.min(hi, Math.floor(w * rules.maxRatio + 1e-9));
  }
  return [lo, hi];
}
function feasibleSteps(steps, rules, floor = 0) {
  const floorOf = typeof floor === "number" ? () => floor : floor;
  let list = steps.map((s) => ({ ...s }));
  for (let guard = 0; guard < 64; guard++) {
    const bad = list.findIndex((s2) => {
      const len = s2.top - s2.bottom;
      return pieceWidths(s2.w).some((pw) => {
        const [lo, hi] = heightBounds(pw, rules);
        return lo > hi || len < lo;
      });
    });
    if (bad < 0) return list;
    const s = list[bad];
    const need = Math.max(...pieceWidths(s.w).map((pw) => heightBounds(pw, rules)[0]));
    const narrow = pieceWidths(s.w).some((pw) => {
      const [lo, hi] = heightBounds(pw, rules);
      return lo > hi;
    });
    if (!narrow && s.top - floorOf(s) >= need) {
      s.bottom = s.top - need;
      continue;
    }
    if (list.length === 1) return null;
    const j = bad === list.length - 1 ? bad - 1 : bad === 0 ? 1 : list[bad - 1].top >= list[bad + 1].top ? bad - 1 : bad + 1;
    const [a, b] = j < bad ? [list[j], s] : [s, list[j]];
    const keep = list[j];
    const merged = { x: a.x, w: a.w + b.w, bottom: keep.bottom, top: keep.top };
    list = list.filter((_, i) => i !== bad && i !== j);
    list.splice(Math.min(bad, j), 0, merged);
  }
  return null;
}
function meetsBetween(left, right) {
  let m = 0;
  for (const a of left) {
    for (const b of right) {
      if ((a.x + a.w === b.x || b.x + b.w === a.x) && (a.y0 + a.h === b.y0 || b.y0 + b.h === a.y0)) m++;
    }
  }
  return m;
}
function cutLength(len, np, lo, hi, rng) {
  const base = Math.floor(len / np);
  const parts = new Array(np).fill(base);
  let extra = len - base * np;
  while (extra > 0) {
    const i = Math.floor(rng() * np);
    if (parts[i] < hi) {
      parts[i]++;
      extra--;
    }
  }
  for (let k = Math.floor(rng() * (np + 1)); k > 0 && np > 1; k--) {
    const i = Math.floor(rng() * np);
    const j = i + (rng() < 0.5 ? -1 : 1);
    if (j < 0 || j >= np) continue;
    if (parts[i] + 1 <= hi && parts[j] - 1 >= lo) {
      parts[i]++;
      parts[j]--;
    }
  }
  return parts;
}
function cutAvoiding(y0, len, np, lo, hi, avoid, rng) {
  let budget = 400;
  const heights = [];
  const go = (y, left, k) => {
    if (--budget < 0) return false;
    if (k === 1) {
      if (left < lo || left > hi) return false;
      heights.push(left);
      return true;
    }
    const from = Math.max(lo, left - (k - 1) * hi);
    const to = Math.min(hi, left - (k - 1) * lo);
    const options = [];
    for (let h = from; h <= to; h++) if (!avoid.has(y + h)) options.push(h);
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    for (const h of options) {
      heights.push(h);
      if (go(y + h, left - h, k - 1)) return true;
      heights.pop();
    }
    return false;
  };
  return go(y0, len, np) ? heights : null;
}
function blockCountBounds(steps, rules) {
  let fewest = 0;
  let most = 0;
  for (const st of steps) {
    for (const pw of pieceWidths(st.w, rules.maxSide)) {
      const [lo, hi] = heightBounds(pw, rules);
      const len = st.top - st.bottom;
      const npMin = Math.ceil(len / hi);
      const npMax = Math.floor(len / lo);
      if (npMin > npMax) return null;
      fewest += npMin;
      most += npMax;
    }
  }
  return { fewest, most };
}
function cutSteps(steps, count, rules, rng) {
  const pieces = [];
  for (const st of steps) {
    let x = st.x;
    for (const pw of pieceWidths(st.w, rules.maxSide)) {
      pieces.push({ x, w: pw, y0: st.bottom, len: st.top - st.bottom });
      x += pw;
    }
  }
  const area = pieces.reduce((a, p) => a + p.w * p.len, 0);
  const out = [];
  let prev = [];
  for (let pi = 0; pi < pieces.length; pi++) {
    const p = pieces[pi];
    const [lo, hi] = heightBounds(p.w, rules);
    const npMin = Math.ceil(p.len / hi);
    const npMax = Math.floor(p.len / lo);
    if (npMin > npMax) return null;
    const np = clamp(Math.round(count * p.w * p.len / area), npMin, npMax);
    let best = null;
    let bestMeets = Infinity;
    const avoid = /* @__PURE__ */ new Set();
    for (const r2 of prev) {
      avoid.add(r2.y0);
      avoid.add(r2.y0 + r2.h);
    }
    const next = pieces[pi + 1];
    if (next) {
      avoid.add(next.y0);
      avoid.add(next.y0 + next.len);
    }
    const counts = [];
    for (let n = npMin; n <= npMax; n++) counts.push(n);
    counts.sort((a, b) => Math.abs(a - np) - Math.abs(b - np) || a - b);
    search: for (const n of counts.slice(0, 6)) {
      for (let t = 0; t < 6; t++) {
        const heights = cutAvoiding(p.y0, p.len, n, lo, hi, avoid, rng) ?? (best ? null : cutLength(p.len, n, lo, hi, rng));
        if (!heights) continue;
        const stack = [];
        let y = p.y0;
        for (const h of heights) {
          stack.push({ x: p.x, y0: y, w: p.w, h });
          y += h;
        }
        const meets = meetsBetween(prev, stack);
        if (meets < bestMeets) {
          best = stack;
          bestMeets = meets;
        }
        if (bestMeets === 0) break search;
      }
    }
    out.push(...best);
    prev = best;
  }
  return out;
}
function newFormulaDiagnostics() {
  return {
    attempts: 0,
    rejected: { unbuilt: 0, trend: 0, cornerMeets: 0, rules: 0, smallBlock: 0, proportion: 0, topRight: 0, shape: 0, set4: 0, coverage: 0 },
    adjusted: 0
  };
}
var ATTEMPTS = 48;
var PREFERRED_COVERAGE = [0.3, 0.6];
var MIN_WINDOW = 3;
function freeStrips(grid, o) {
  const strips = [
    { col: 0, row: 0, w: grid.cols, h: o.row },
    { col: 0, row: o.row + o.h, w: grid.cols, h: grid.rows - o.row - o.h },
    { col: 0, row: 0, w: o.col, h: grid.rows },
    { col: o.col + o.w, row: 0, w: grid.cols - o.col - o.w, h: grid.rows }
  ];
  return strips.filter((r2) => r2.w >= MIN_WINDOW && r2.h >= MIN_WINDOW).sort((a, b) => b.w * b.h - a.w * a.h);
}
function plansFor(grid, zone, slope) {
  const plans = [];
  for (const cover of zone.covers ?? [void 0]) {
    const hole = cover ?? zone.area;
    const strips = freeStrips(grid, hole);
    for (const [i, w] of strips.slice(0, 2).entries()) {
      if (i === 0 || w.w * w.h >= 0.6 * strips[0].w * strips[0].h) {
        plans.push({ window: w, hole, ...cover ? { cover } : {} });
        for (const aspect of [1.2, 1.7]) {
          const narrow = Math.max(MIN_WINDOW, Math.round(w.h * aspect));
          if (slope === "75" && w.w > narrow + 1) {
            plans.push({ window: { ...w, col: w.col + w.w - narrow, w: narrow }, hole, ...cover ? { cover } : {} });
            plans.push({ window: { ...w, w: narrow }, hole, ...cover ? { cover } : {} });
          }
        }
      }
    }
    plans.push({ window: null, hole, ...cover ? { cover } : {} });
  }
  return plans;
}
function keepsFamilyEdges(blocks, grid, family) {
  const bottom = blocks.some((b) => b.row + b.h === grid.rows);
  if (family === "rising") return bottom;
  if (family === "hanging") return !bottom && blocks.some((b) => b.row === 0) && blocks.some((b) => b.col === 0) && blocks.some((b) => b.col + b.w === grid.cols);
  return !blocks.some((b) => b.col === 0);
}
function formulaApplies(params, count) {
  return usesSet4Rules(params.referenceSet) && count >= 3;
}
function blockCountTolerance(count) {
  return Math.max(1, Math.round(count * 0.1));
}
function drawFormula(input, rng, diag2) {
  const first = drawPass(input, rng, diag2, false);
  const zone = input.zone;
  const tolerance = blockCountTolerance(input.count);
  const poor = !first || first.covered < PREFERRED_COVERAGE[0] || first.miss > tolerance;
  if (!zone || !poor) return settle(first, diag2, false);
  const second = drawPass(input, rng, diag2, true);
  const useSecond = !!second && (!first || second.score < first.score);
  return settle(useSecond ? second : first, diag2, useSecond);
}
function settle(kept, diag2, waived) {
  if (!kept) return null;
  if (diag2) {
    diag2.settings = { ...kept.settings };
    if (kept.plan) diag2.plan = kept.plan.window ? "window" : "clip";
    if (waived) diag2.trendWaived = true;
  }
  return kept.blocks;
}
function drawPass(input, rng, diag2, waiveTrend) {
  const { grid, slope, rules } = input;
  const family = input.family ?? "rising";
  const row = shapeRangeFor(slope, family);
  if (!row) return null;
  if (diag2) diag2.family = family;
  const variation = clamp((input.variation ?? DEFAULT_VARIATION) / 100, 0, 1);
  const given = input.shape ?? {};
  const yields = given.lift !== void 0 && given.bandThickness === void 0 ? "bandThickness" : given.bandThickness !== void 0 && given.lift === void 0 ? "lift" : "bandThickness";
  const sh = { family, row, yields };
  const band = trendBandFor(slope, family);
  const reject = (reason) => {
    if (diag2) diag2.rejected[reason]++;
  };
  const zone = input.zone;
  const plans = zone ? plansFor(grid, zone, slope) : [null];
  const pageArea = grid.cols * grid.rows;
  const trendAsked = !waiveTrend && (!zone || Math.min(grid.cols, grid.rows) >= TREND_MEASURABLE_FROM);
  const cornerHeld = !!zone && !zone.covers && zone.area.row === 0 && zone.area.col + zone.area.w === grid.cols;
  let best = null;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    if (diag2) diag2.attempts++;
    const plan = plans[attempt % plans.length];
    const origin = plan?.window ?? { col: 0, row: 0, w: grid.cols, h: grid.rows };
    const pg = plan?.window ? { ...grid, cols: origin.w, rows: origin.h } : grid;
    const local = (c) => ({ x0: c.col - origin.col, x1: c.col - origin.col + c.w, y0: origin.row + origin.h - c.row - c.h, y1: origin.row + origin.h - c.row });
    const cut = plan && !plan.window ? local(plan.hole) : void 0;
    const s = sampleSettings(row, given, variation, rng);
    const noise = drawNoise(Math.max(2, Math.ceil(s.columns) + 1), variation, rng);
    const make = (v) => {
      const drawn = shapeSteps(v, noise, variation, pg, slope, sh);
      return cut ? standOnBottom(cutAround(drawn, cut), sh, cut) : drawn;
    };
    let steps = make(s);
    if (trendAsked && !trendOk(steps, pg, band)) {
      const fitted = fitStart(s, pg, band, make);
      if (!fitted) {
        reject("trend");
        continue;
      }
      steps = fitted;
      if (diag2) diag2.adjusted++;
    }
    const lowest = family === "rising" ? 0 : Math.min(...steps.map((st) => st.bottom));
    const floorOf = cut ? (st) => st.x < cut.x1 && cut.x0 < st.x + st.w && st.bottom >= cut.y1 ? cut.y1 : lowest : lowest;
    const feasible = feasibleSteps(steps, rules, floorOf);
    const roomy = feasible && standOnBottom(feasible, sh, cut);
    if (!roomy || roomy.length === 0 || cut && roomy.some((st) => stepHits(st, cut))) {
      reject("unbuilt");
      continue;
    }
    const placed = plan?.cover ? joinCover(roomy, local(plan.cover)) : roomy;
    const rects = cutSteps(placed, plan?.cover ? Math.max(1, input.count - 1) : input.count, rules, rng);
    if (!rects || rects.length === 0) {
      reject("unbuilt");
      continue;
    }
    const bottomY = grid.rows - (origin.row + origin.h);
    const blocks = rects.map((r2, i) => ({
      id: `block-${i + 1}`,
      col: origin.col + r2.x,
      row: grid.rows - (bottomY + r2.y0) - r2.h,
      w: r2.w,
      h: r2.h,
      tint: 0
    }));
    if (plan?.cover) blocks.push({ id: `block-${blocks.length + 1}`, col: plan.cover.col, row: plan.cover.row, w: plan.cover.w, h: plan.cover.h, tint: 0 });
    if (countCornerMeets(blocks).length > input.cornerMeetLimit) {
      reject("cornerMeets");
      continue;
    }
    const problem = blockRuleProblem(blocks, rules);
    if (problem) {
      reject(problem);
      continue;
    }
    const set4 = input.set4Problem?.(blocks);
    if (set4 && !(waiveTrend && set4 === "trend")) {
      reject("set4");
      continue;
    }
    if (!checkPatternRules(blocks, grid).ok) {
      reject("rules");
      continue;
    }
    if (slope === "75" && !cornerHeld && blocks.length >= 2 && !blocks.some((b) => b.row === 0 && b.col + b.w === grid.cols)) {
      reject("topRight");
      continue;
    }
    const trend = cellTrend(blocks, grid);
    if (trendAsked && trend !== null && blocks.length >= 2 && (trend < band[0] || trend > band[1])) {
      reject("trend");
      continue;
    }
    if (slopeShapeProblem(blocks, grid, slope)) {
      reject("shape");
      continue;
    }
    const free = plan ? pageArea - plan.hole.w * plan.hole.h : pageArea;
    const covered = (blocks.reduce((a, b) => a + b.w * b.h, 0) - (plan?.cover ? plan.cover.w * plan.cover.h : 0)) / free;
    if (plan && covered < COVERAGE_LIMIT[0]) {
      reject("coverage");
      continue;
    }
    const coverageErr = Math.max(0, PREFERRED_COVERAGE[0] - covered, covered - PREFERRED_COVERAGE[1]);
    const miss = Math.abs(input.count - blocks.length);
    const edges = !plan || keepsFamilyEdges(blocks, grid, family);
    const score = miss * 100 + coverageErr * 100 + (covered < COVERAGE_LIMIT[0] ? 1e3 : 0) + (edges ? 0 : EDGES_PENALTY);
    if (!best || score < best.score) best = { blocks, score, settings: s, plan, covered, miss };
    if (edges && coverageErr === 0 && miss <= blockCountTolerance(input.count) && covered >= COVERAGE_LIMIT[0]) break;
  }
  return best;
}
var EDGES_PENALTY = 200;
var trendBandFor = (slope, family) => {
  const [min, max] = SLOPE_TREND_BAND[slope];
  return family === "mountain" && slope !== "flat" ? [min, Infinity] : [min, max];
};
var trendOk = (steps, grid, band) => {
  if (steps.length < 2) return true;
  const trend = cellTrend(stepBlocks(steps, grid), grid);
  return trend === null || trend >= band[0] && trend <= band[1];
};
function fitStart(s, grid, band, make) {
  const rows = grid.rows;
  const home = Math.round(s.startHeight * rows);
  for (let delta = 1; delta <= rows; delta++) {
    for (const sign of [1, -1]) {
      const r2 = home + sign * delta;
      if (r2 < 1 || r2 > rows) continue;
      const steps = make({ ...s, startHeight: r2 / rows });
      if (trendOk(steps, grid, band)) return steps;
    }
  }
  return null;
}

// packages/core/src/freeShapeRanges.ts
function freeShapeBlockRanges(grid) {
  const cells = grid.cols * grid.rows;
  return {
    blockCount: { min: 1, max: cells },
    smallestBlock: { min: 1, max: cells },
    blockProportion: { min: 1, max: Math.max(grid.cols, grid.rows) },
    cornerMeetLimit: { min: 0, max: Math.max(0, (grid.cols - 1) * (grid.rows - 1)) }
  };
}
function freeShapeBlockProblem(generator, grid) {
  const r2 = freeShapeBlockRanges(grid);
  const whole = (v, range) => typeof v === "number" && Number.isInteger(v) && v >= range.min && v <= range.max;
  const { blockCount, cornerMeetLimit, smallestBlock, blockProportion } = generator;
  if (!whole(blockCount, r2.blockCount)) return `blockCount must be a whole number from ${r2.blockCount.min} to ${r2.blockCount.max} on this Grid while Free shape is on.`;
  if (!whole(cornerMeetLimit, r2.cornerMeetLimit)) {
    return `cornerMeetLimit must be a whole number from ${r2.cornerMeetLimit.min} to ${r2.cornerMeetLimit.max} on this Grid while Free shape is on.`;
  }
  if (smallestBlock !== void 0 && !whole(smallestBlock, r2.smallestBlock)) {
    return `smallestBlock must be a whole number of cells from ${r2.smallestBlock.min} to ${r2.smallestBlock.max} on this Grid while Free shape is on.`;
  }
  if (blockProportion !== void 0 && !(Number.isFinite(blockProportion) && blockProportion >= r2.blockProportion.min)) {
    return `blockProportion must be a number of at least ${r2.blockProportion.min} while Free shape is on.`;
  }
  return null;
}

// packages/core/src/formulaParams.ts
var LISTED = { shape: true, variation: true, smallestBlock: true, blockProportion: true };
var FORMULA_SETTING_KEYS = Object.keys(LISTED);
var BLOCK_SETTING_KEYS = ["smallestBlock", "blockProportion"];
function formulaSettingsOf(source) {
  const out = {};
  for (const key of FORMULA_SETTING_KEYS) if (source[key] !== void 0) out[key] = source[key];
  return out;
}
function setsABlockSetting(settings) {
  return BLOCK_SETTING_KEYS.some((key) => settings[key] !== void 0);
}
function withoutBlockSettings(generator) {
  if (!setsABlockSetting(generator)) return generator;
  const out = { ...generator };
  for (const key of BLOCK_SETTING_KEYS) delete out[key];
  return out;
}
var SHAPE_KEY_ORDER = SHAPE_SETTINGS.flatMap((s) => s.keys);
function formulaSettingsToLink(settings) {
  if (FORMULA_SETTING_KEYS.every((key) => settings[key] === void 0)) return null;
  const { shape } = settings;
  const pairs = shape ? SHAPE_KEY_ORDER.flatMap((key, i) => shape[key] === void 0 ? [] : [[i, shape[key]]]) : null;
  return FORMULA_SETTING_KEYS.map((key) => key === "shape" ? pairs : settings[key] ?? null);
}
function formulaSettingsFromLink(v) {
  if (!Array.isArray(v) || v.length !== FORMULA_SETTING_KEYS.length) return null;
  const out = {};
  for (const [i, key] of FORMULA_SETTING_KEYS.entries()) {
    const value = v[i];
    if (value === null) continue;
    if (key !== "shape") {
      if (typeof value !== "number") return null;
      out[key] = value;
      continue;
    }
    if (!Array.isArray(value)) return null;
    const shape = {};
    for (const pair of value) {
      if (!Array.isArray(pair) || pair.length !== 2 || !Number.isInteger(pair[0]) || typeof pair[1] !== "number") return null;
      const name = SHAPE_KEY_ORDER[pair[0]];
      if (!name) return null;
      shape[name] = pair[1];
    }
    out.shape = shape;
  }
  return out;
}
function formulaFamilyFor(generator) {
  return generator.family === "hanging" || generator.family === "mountain" ? generator.family : "rising";
}
function validateFormulaParams(generator, density, grid) {
  const { shape, variation, smallestBlock, blockProportion } = generator;
  if (variation !== void 0 && !(Number.isInteger(variation) && variation >= 0 && variation <= 100)) {
    return "variation must be a whole number from 0 to 100.";
  }
  if (generator.freeShape !== void 0) {
    const problem = freeShapeBlockProblem(generator, grid);
    if (problem) return problem;
  } else if (smallestBlock !== void 0) {
    const { min, max } = blockSettingRangesFor(density).smallestBlockArea;
    if (!(Number.isInteger(smallestBlock) && smallestBlock >= min && smallestBlock <= max)) {
      return `smallestBlock must be a whole number of cells from ${min} to ${max} on a ${density} Grid.`;
    }
  }
  if (generator.freeShape === void 0 && blockProportion !== void 0) {
    const { min, max } = blockSettingRangesFor(density).blockProportion;
    if (!(Number.isFinite(blockProportion) && blockProportion >= min && blockProportion <= max)) {
      return `blockProportion must be a number from ${min} to ${max} on a ${density} Grid.`;
    }
  }
  if (shape === void 0) return null;
  if (typeof shape !== "object" || shape === null) return "shape must be an object of Shape settings.";
  const family = formulaFamilyFor(generator);
  const row = shapeRangeFor(generator.slope, family);
  const known = new Set(SHAPE_SETTINGS.flatMap((s) => s.keys));
  for (const [key, value] of Object.entries(shape)) {
    if (!known.has(key)) return `${key} is not a Shape setting.`;
    const range = row?.settings[key];
    if (!row) return `There are no Reference Patterns of the ${generator.slope} Slope in the ${family} family to set ${key} by.`;
    if (!range) return `${key} is not a setting of ${family} Patterns.`;
    if (typeof value !== "number" || !Number.isFinite(value) || value < range.min || value > range.max) {
      return `${key} must be a number from ${range.min} to ${range.max} for a ${generator.slope} ${family} Pattern.`;
    }
  }
  return null;
}

// packages/core/src/grid.ts
function gridFor(doc) {
  const levels = densityLevelsFor(doc.format, doc.customSize);
  const matched = levels.find((lvl) => lvl.level === doc.density);
  const target = matched ?? levels.find((lvl) => lvl.isCiStandard) ?? levels[0];
  if (target) {
    return {
      cols: target.cols,
      rows: target.rows,
      cellW: target.cellW,
      cellH: target.cellH,
      ...target.cellPx !== void 0 ? { cellPx: target.cellPx } : {}
    };
  }
  return { cols: 16, rows: 16, cellW: 120, cellH: 120, cellPx: 120 };
}

// packages/core/src/freeShape.ts
var MOST_COLUMNS = 48;
var FREE_SHAPE_SETTINGS = [
  { key: "startHeight", label: "Start height", kind: "share", min: 0, max: 1, required: true },
  { key: "endHeight", label: "End height", kind: "share", min: 0, max: 1, required: true },
  { key: "curve", label: "Curve", kind: "share", min: -1, max: 1, required: true },
  { key: "peakAt", label: "Peak position", kind: "share", min: 0, max: 1, required: false },
  { key: "peakHeight", label: "Peak height", kind: "share", min: 0, max: 1, required: false },
  { key: "columns", label: "Columns", kind: "count", min: 1, max: MOST_COLUMNS, required: false },
  { key: "unevenness", label: "Unevenness", kind: "share", min: 0, max: 1, required: false, default: 0 },
  { key: "roughness", label: "Roughness", kind: "share", min: 0, max: 1, required: false, default: 0 },
  { key: "dipShare", label: "Dip share", kind: "share", min: 0, max: 1, required: false, default: 0 },
  { key: "dipDepth", label: "Dip depth", kind: "share", min: 0, max: 1, required: false, default: 0 },
  { key: "bandThickness", label: "Band thickness", kind: "share", min: 0, max: 1, required: false, default: 1 },
  { key: "lift", label: "Lift", kind: "share", min: 0, max: 1, required: false, default: 0 },
  { key: "insetLeft", label: "Inset left", kind: "share", min: 0, max: 1, required: false, default: 0 },
  { key: "insetRight", label: "Inset right", kind: "share", min: 0, max: 1, required: false, default: 0 },
  { key: "hangFromTop", label: "Hang from top", kind: "flag", min: 0, max: 1, required: false },
  { key: "mirror", label: "Mirror", kind: "flag", min: 0, max: 1, required: false }
];
var BY_KEY = new Map(FREE_SHAPE_SETTINGS.map((s) => [s.key, s]));
var FREE_SHAPE_DEFAULT = { startHeight: 0.25, endHeight: 0.85, curve: 0 };
function validateFreeShape(value, cols) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return "freeShape must be an object of Free shape settings.";
  const record = value;
  for (const [key, v] of Object.entries(record)) {
    const setting = BY_KEY.get(key);
    if (!setting) return `${key} is not a Free shape setting.`;
    if (setting.kind === "flag") {
      if (typeof v !== "boolean") return `${key} must be true or false.`;
      continue;
    }
    if (setting.kind === "count") {
      const top = Math.min(setting.max, cols ?? setting.max);
      if (typeof v !== "number" || !Number.isInteger(v) || v < setting.min || v > top) return `${key} must be a whole number from ${setting.min} to ${top}.`;
      continue;
    }
    if (typeof v !== "number" || !Number.isFinite(v) || v < setting.min || v > setting.max) {
      return `${key} must be a number from ${setting.min} to ${setting.max}.`;
    }
  }
  for (const setting of FREE_SHAPE_SETTINGS) {
    if (setting.required && record[setting.key] === void 0) return `${setting.key} is required in freeShape.`;
  }
  if (record.peakAt === void 0 !== (record.peakHeight === void 0)) return "A Peak needs both peakAt and peakHeight, or neither.";
  if ((record.insetLeft ?? 0) + (record.insetRight ?? 0) >= 1) {
    return "insetLeft and insetRight together must leave at least one column (their sum must be under 1).";
  }
  return null;
}
function cleanFreeShape(group) {
  const out = {};
  for (const s of FREE_SHAPE_SETTINGS) {
    const v = group[s.key];
    if (v !== void 0) out[s.key] = v;
  }
  return out;
}
function fitFreeShapeToGrid(doc) {
  const group = doc.generator.freeShape;
  if (!group) return doc;
  const grid = gridFor(doc);
  const ranges = freeShapeBlockRanges(grid);
  const { cornerMeetLimit, smallestBlock } = doc.generator;
  const fitted = {
    ...doc.generator,
    ...group.columns !== void 0 && group.columns > grid.cols ? { freeShape: { ...group, columns: grid.cols } } : {},
    ...cornerMeetLimit > ranges.cornerMeetLimit.max ? { cornerMeetLimit: ranges.cornerMeetLimit.max } : {},
    ...smallestBlock !== void 0 && smallestBlock > ranges.smallestBlock.max ? { smallestBlock: ranges.smallestBlock.max } : {}
  };
  const changed = Object.keys(fitted).some((key) => fitted[key] !== doc.generator[key]);
  return changed ? { ...doc, generator: fitted } : doc;
}
var CURVE_RATIO = 0.45;
function freeShapeFrom(generator) {
  const family = generator.family === "hanging" || generator.family === "mountain" ? generator.family : "rising";
  const row = shapeRangeFor(generator.slope, family);
  const pick = (key) => generator.shape?.[key] ?? row?.settings[key]?.default;
  const start = pick("startHeight");
  const end = pick("endHeight");
  if (start === void 0 || end === void 0) return { ...FREE_SHAPE_DEFAULT };
  const curve = pick("curve") ?? 0;
  const rise = end - start;
  const bend = Math.abs(rise) > 0.02 ? Math.max(-1, Math.min(1, curve / Math.abs(rise) / CURVE_RATIO)) : 0;
  const round2 = (n) => Math.round(n * 1e3) / 1e3;
  return { startHeight: round2(Math.min(1, Math.max(0, start))), endHeight: round2(Math.min(1, Math.max(0, end))), curve: round2(bend) };
}
function shareLinkProblem(doc) {
  return doc.generator.freeShape ? "Free shape is on, so this Document has no share link: a link would draw its Pattern again somewhere that has no Free shape. Save a .fnm file instead, or turn Free shape off." : null;
}
function defaultFreeShapeColumns(cols) {
  return Math.min(cols, Math.max(2, Math.round(cols * 3 / 8)));
}
function exponent(curve, rise) {
  const ratio = Math.max(-CURVE_RATIO, Math.min(CURVE_RATIO, CURVE_RATIO * curve * Math.sign(rise)));
  return 1 / (ratio + 0.5) - 1;
}
function outlineHeight(group, t) {
  const points = [[0, group.startHeight]];
  if (group.peakAt !== void 0 && group.peakHeight !== void 0) points.push([group.peakAt, group.peakHeight]);
  points.push([1, group.endHeight]);
  for (let i = 0; i + 1 < points.length; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    if (x1 - x0 < 1e-9 || t < x0 || t > x1) continue;
    const rise = y1 - y0;
    return y0 + rise * ((t - x0) / (x1 - x0)) ** exponent(group.curve, rise);
  }
  return points[points.length - 1][1];
}
var clamp2 = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
function freeShapeNoise(group, variation, cols, rng) {
  const v = clamp2(variation, 0, 1);
  const moves = (group.unevenness ?? 0) > 0 || (group.roughness ?? 0) > 0 || (group.dipShare ?? 0) > 0;
  const unit = () => Array.from({ length: cols }, () => v > 0 && moves ? rng() * 2 - 1 : 0);
  return { variation: v, width: unit(), rough: unit(), dip: unit() };
}
function columnsFitHalf(group, half) {
  return group.columns === void 0 || group.columns <= half.cols;
}
function insetCells(group, cols) {
  let left = Math.round((group.insetLeft ?? 0) * cols);
  let right = Math.round((group.insetRight ?? 0) * cols);
  while (left + right > cols - 1) {
    if (left >= right) left--;
    else right--;
  }
  return { left, right };
}
function outlineSteps(grid, group, noise) {
  const { cols, rows } = grid;
  const v = noise?.variation ?? 0;
  const inset = insetCells(group, cols);
  const span = cols - inset.left - inset.right;
  const n = clamp2(Math.round(group.columns ?? defaultFreeShapeColumns(cols)), 1, span);
  const unevenness = group.unevenness ?? 0;
  const alt = Array.from({ length: n }, (_, i) => i % 2 === 0 ? -1 : 1);
  const m = alt.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(alt.reduce((a, b) => a + (b - m) ** 2, 0) / n) || 1;
  const raw = alt.map((a, i) => Math.max(0.25, 1 + unevenness * ((1 - v) * ((a - m) / sd) + v * Math.sqrt(3) * (noise?.width[i] ?? 0))));
  const widths = apportion(raw, span);
  const starts = [];
  let x = inset.left;
  for (const w of widths) {
    starts.push(x);
    x += w;
  }
  const centres = widths.map((w, i) => starts[i] + w / 2);
  const reach = centres[n - 1] - centres[0];
  const h = centres.map((c) => outlineHeight(group, reach > 0 ? (c - centres[0]) / reach : 1));
  const roughness = group.roughness ?? 0;
  for (let i = 1; i < n - 1; i++) {
    const sign = (1 - v) * (i % 2 === 0 ? 1 : -1) + v * (noise?.rough[i] ?? 0);
    h[i] += roughness / 2 * sign;
  }
  const inner = Math.max(0, n - 2);
  const dips = Math.min(Math.floor((inner + 1) / 2), Math.round((group.dipShare ?? 0) * inner));
  const dipAt = /* @__PURE__ */ new Set();
  for (let k = 0; k < dips; k++) {
    const spacing = inner / dips;
    const j = 1 + Math.floor((k + 0.5) * spacing + v * (noise?.dip[k] ?? 0) * (spacing / 2 - 0.5));
    dipAt.add(clamp2(j, 1, n - 2));
  }
  for (const j of [...dipAt].sort((p, q) => p - q)) {
    if (dipAt.has(j - 1) || dipAt.has(j + 1)) continue;
    h[j] = Math.min(h[j - 1], h[j + 1]) - (group.dipDepth ?? 0);
  }
  const floor = Math.min(rows - 1, Math.round((group.lift ?? 0) * rows));
  const band = Math.max(1, Math.round((group.bandThickness ?? 1) * rows));
  const top = h.map((value) => clamp2(Math.round(value * rows), floor + 1, rows));
  const bottom = top.map((t) => Math.max(floor, t - band));
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 1; i < n; i++) {
      if (Math.max(bottom[i], bottom[i - 1]) < Math.min(top[i], top[i - 1])) continue;
      if (top[i] > top[i - 1]) bottom[i] = Math.min(bottom[i], top[i - 1] - 1);
      else bottom[i - 1] = Math.min(bottom[i - 1], top[i] - 1);
    }
  }
  return widths.map((w, i) => ({ x: starts[i], w, bottom: bottom[i], top: top[i] }));
}
function flipFreeShape(blocks, grid, group) {
  if (!group.hangFromTop && !group.mirror) return blocks;
  return blocks.map((b) => ({
    ...b,
    ...group.hangFromTop ? { row: grid.rows - b.row - b.h } : {},
    ...group.mirror ? { col: grid.cols - b.col - b.w } : {}
  }));
}
var ATTEMPTS2 = 48;
function freeShapeRejection(failure) {
  return { code: "freeShape.failed", message: failure.message };
}
function freeShapeRules(ask) {
  return { minArea: ask.smallestBlock ?? 0, ...ask.blockProportion !== void 0 ? { maxRatio: ask.blockProportion } : {} };
}
var WIDER_SIDES = [16, 32, 64];
var NARROWER_SIDES = [4, 2, 1];
function joinFlat(steps) {
  const out = [];
  for (const s of steps) {
    const last = out[out.length - 1];
    if (last && last.bottom === s.bottom && last.top === s.top) out[out.length - 1] = { ...last, w: last.w + s.w };
    else out.push({ ...s });
  }
  return out;
}
function planCut(steps, count, rules, defaultCount) {
  const plain = steps.map((s) => ({ ...s }));
  const joined = joinFlat(steps);
  if (defaultCount && blockCountBounds(plain, rules)) return { steps: plain, rules };
  const withSide = (maxSide) => maxSide === void 0 ? rules : { ...rules, maxSide };
  const options = [
    { steps: plain, rules },
    ...WIDER_SIDES.map((side) => ({ steps: plain, rules: withSide(side) })),
    ...[void 0, ...WIDER_SIDES].map((side) => ({ steps: joined, rules: withSide(side) })),
    ...NARROWER_SIDES.map((side) => ({ steps: plain, rules: withSide(side) }))
  ];
  let nearest2 = null;
  for (const option of options) {
    const bounds = blockCountBounds(option.steps, option.rules);
    if (!bounds) continue;
    if (count >= bounds.fewest && count <= bounds.most) return option;
    const gap = count < bounds.fewest ? bounds.fewest - count : count - bounds.most;
    if (!nearest2 || gap < nearest2.gap) nearest2 = { ...option, gap };
  }
  return nearest2;
}
var rectToBlock = (r2, i, grid) => ({
  id: `block-${i + 1}`,
  col: r2.x,
  row: grid.rows - r2.y0 - r2.h,
  w: r2.w,
  h: r2.h,
  tint: 0
});
function ruleMessage(rule, ask) {
  return rule === "smallBlock" ? `Smallest Block asks for ${ask.smallestBlock} cells and these steps have no Block that large` : `Block proportion allows at most ${ask.blockProportion}:1 and these steps have no Block that square`;
}
function drawFreeShape(grid, group, rng, ask, diagnostics, noise) {
  const steps = outlineSteps(grid, group, noise);
  const rules = freeShapeRules(ask);
  const failed = /* @__PURE__ */ new Map();
  const fail = (rule2, message) => {
    const seen = failed.get(rule2);
    failed.set(rule2, { n: (seen?.n ?? 0) + 1, message: seen?.message ?? message });
    if (diagnostics) diagnostics.rejected[rule2] = (diagnostics.rejected[rule2] ?? 0) + 1;
  };
  const plan = planCut(steps, ask.count, rules, ask.defaultCount === true);
  for (let attempt = 0; attempt < ATTEMPTS2; attempt++) {
    if (diagnostics) diagnostics.attempts++;
    const rects = plan ? cutSteps(plan.steps, ask.count, plan.rules, rng) : null;
    if (!rects || rects.length === 0) {
      const loose = cutSteps(steps, ask.count, { minArea: 0 }, rng);
      const culprit = loose ? blockRuleProblem(loose.map((r2, i) => rectToBlock(r2, i, grid)), rules) : null;
      if (culprit) fail(culprit, ruleMessage(culprit, ask));
      else fail("unbuilt", "the outline could not be cut into Blocks");
      break;
    }
    const blocks = rects.map((r2, i) => rectToBlock(r2, i, grid));
    const pattern = checkPatternRules(blocks, grid);
    if (!pattern.ok) {
      for (const v of pattern.violations) fail(v.slice(0, v.indexOf(":")), v);
      break;
    }
    const broken = blockRuleProblem(blocks, rules);
    if (broken) {
      fail(broken, ruleMessage(broken, ask));
      continue;
    }
    const meets = countCornerMeets(blocks).length;
    if (meets > ask.cornerMeetLimit) {
      fail("cornerMeets", `the Blocks make ${meets} Corner meets (the limit is ${ask.cornerMeetLimit})`);
      continue;
    }
    return { blocks };
  }
  const [rule, worst] = [...failed.entries()].sort((a, b) => b[1].n - a[1].n)[0] ?? ["unbuilt", { n: 0, message: "nothing was drawn" }];
  if (diagnostics) diagnostics.failedRule = rule;
  return { blocks: [], failure: { rule, message: `Free shape could not draw this outline: the rule that failed most was ${rule} (${worst.message}). Move a setting back.` } };
}

// packages/core/src/cornerMeet.ts
var CORNER_MEET_CHANCE = 0.35;
var transpose = (blocks) => blocks.map((b) => ({ ...b, col: b.row, row: b.col, w: b.h, h: b.w }));
function alignedCuts(blocks, grid) {
  const minSide = Math.min(grid.cols, grid.rows) < 16 ? 1 : 2;
  const out = [];
  blocks.forEach((upper, i) => {
    const j = blocks.findIndex((b) => b.col === upper.col && b.w === upper.w && b.row === upper.row + upper.h);
    if (j < 0) return;
    const lower = blocks[j];
    const beside = blocks.filter((b) => b.col + b.w === upper.col || b.col === upper.col + upper.w);
    for (const y of new Set(beside.flatMap((b) => [b.row, b.row + b.h]))) {
      if (y === lower.row || y - upper.row < minSide || lower.row + lower.h - y < minSide) continue;
      const next = blocks.slice();
      next[i] = { ...upper, h: y - upper.row };
      next[j] = { ...lower, row: y, h: lower.row + lower.h - y };
      out.push(next);
    }
  });
  return out;
}
function maybeAddCornerMeet(blocks, grid, rng, cornerMeetLimit, slope) {
  if (blocks.length < 3 || cornerMeetLimit < 1 || countCornerMeets(blocks).length > 0) return blocks;
  if (rng() >= CORNER_MEET_CHANCE) return blocks;
  const turned = { ...grid, cols: grid.rows, rows: grid.cols };
  const candidates = [...alignedCuts(blocks, grid), ...alignedCuts(transpose(blocks), turned).map(transpose)].filter(
    (v) => {
      const meets = countCornerMeets(v).length;
      return meets >= 1 && meets <= cornerMeetLimit && keepsGrowth(v, grid, slope);
    }
  );
  if (candidates.length === 0) return blocks;
  return candidates[Math.floor(rng() * candidates.length)];
}

// packages/core/src/textZone.ts
var CLEAR_ZONE_MAX_OVERLAP = 0.15;
var CLEAR_ZONE_RING_DEPTH = 1;
var NONE = { covered: 0, area: 0, share: 0, reachesInterior: false, withinLimit: true };
var inRing = (z, c, r2) => c - z.col < CLEAR_ZONE_RING_DEPTH || z.col + z.w - 1 - c < CLEAR_ZONE_RING_DEPTH || r2 - z.row < CLEAR_ZONE_RING_DEPTH || z.row + z.h - 1 - r2 < CLEAR_ZONE_RING_DEPTH;
function measureClearZoneOverlap(page) {
  const zone = page.textZone;
  if (!zone || zone.mode !== "clear") return NONE;
  const area = zone.w * zone.h;
  const cells = /* @__PURE__ */ new Set();
  let reachesInterior = false;
  for (const b of page.pattern) {
    const c1 = Math.min(b.col + b.w, zone.col + zone.w);
    const r1 = Math.min(b.row + b.h, zone.row + zone.h);
    for (let c = Math.max(b.col, zone.col); c < c1; c++) {
      for (let r2 = Math.max(b.row, zone.row); r2 < r1; r2++) {
        cells.add(`${c},${r2}`);
        if (!inRing(zone, c, r2)) reachesInterior = true;
      }
    }
  }
  const share = cells.size / area;
  return {
    covered: cells.size,
    area,
    share,
    reachesInterior,
    withinLimit: !reachesInterior && share <= CLEAR_ZONE_MAX_OVERLAP
  };
}

// packages/core/src/templateMode.ts
var TEMPLATE_FROM = 40;
var TEMPLATE_FULL = 90;
var ATTEMPTS3 = 8;
var JITTER_SHARE = 0.15;
var GUIDANCE_SIMILARITY_SHARE = 0.9;
var GOAL_MARGIN = 0.03;
var VARIETY_SPREAD = 0.15;
function templateChance(guidance) {
  return Math.min(1, Math.max(0, (guidance - TEMPLATE_FROM) / (TEMPLATE_FULL - TEMPLATE_FROM)));
}
function isTemplateModeCertain(guidance) {
  return templateChance(guidance) >= 1;
}
function scaleMask(mask, grid) {
  const n = REFERENCE_SIZE;
  return Array.from(
    { length: grid.rows },
    (_, r2) => Array.from({ length: grid.cols }, (_2, c) => {
      const rr = Math.min(n - 1, Math.floor((r2 + 0.5) * n / grid.rows));
      const cc = Math.min(n - 1, Math.floor((c + 0.5) * n / grid.cols));
      return mask[rr][cc] === "#";
    })
  );
}
function coverMask(mask, grid) {
  const n = REFERENCE_SIZE;
  const overlap = (i, t, size) => Math.max(0, Math.min((i + 1) * size, (t + 1) * n) - Math.max(i * size, t * n));
  return Array.from(
    { length: grid.rows },
    (_, r2) => Array.from({ length: grid.cols }, (_2, c) => {
      let filled = 0;
      for (let i = 0; i < n; i++) {
        const oy = overlap(i, r2, grid.rows);
        if (oy === 0) continue;
        for (let j = 0; j < n; j++) {
          if (mask[i][j] === "#") filled += oy * overlap(j, c, grid.cols);
        }
      }
      return 2 * filled >= n * n;
    })
  );
}
function templateMask(mask, grid, referenceSet) {
  return (referenceSet ?? 1) >= AREA_RESAMPLE_SET ? coverMask(mask, grid) : scaleMask(mask, grid);
}
function runRects(m) {
  const out = [];
  let open = /* @__PURE__ */ new Map();
  for (let r2 = 0; r2 < m.length; r2++) {
    const next = /* @__PURE__ */ new Map();
    const row = m[r2];
    let c = 0;
    while (c < row.length) {
      if (!row[c]) {
        c++;
        continue;
      }
      const start = c;
      while (c < row.length && row[c]) c++;
      const key = `${start},${c - start}`;
      const prev = open.get(key);
      if (prev) {
        prev.h++;
        next.set(key, prev);
      } else {
        const rect2 = { col: start, row: r2, w: c - start, h: 1 };
        out.push(rect2);
        next.set(key, rect2);
      }
    }
    open = next;
  }
  return out;
}
function transpose2(m) {
  return (m[0] ?? []).map((_, c) => m.map((row) => row[c]));
}
function decompose(m) {
  const a = runRects(m);
  const b = runRects(transpose2(m)).map((r2) => ({ col: r2.row, row: r2.col, w: r2.h, h: r2.w }));
  return b.length < a.length ? b : a;
}
function splitTo(rects, target, fixed, rng) {
  while (rects.length < target) {
    let at = -1;
    for (let i = 0; i < rects.length; i++) {
      if (i === fixed) continue;
      const r3 = rects[i];
      if (r3.w * r3.h > 1 && (at < 0 || r3.w * r3.h > rects[at].w * rects[at].h)) at = i;
    }
    if (at < 0) return;
    const r2 = rects[at];
    const alongW = r2.w === r2.h ? rng() < 0.5 : r2.w > r2.h;
    const len = alongW ? r2.w : r2.h;
    const lo = Math.max(1, Math.ceil(len * 0.35));
    const hi = Math.min(len - 1, Math.floor(len * 0.65));
    const cut = hi >= lo ? lo + Math.floor(rng() * (hi - lo + 1)) : Math.floor(len / 2);
    const rest = alongW ? { col: r2.col + cut, row: r2.row, w: r2.w - cut, h: r2.h } : { col: r2.col, row: r2.row + cut, w: r2.w, h: r2.h - cut };
    if (alongW) r2.w = cut;
    else r2.h = cut;
    rects.push(rest);
  }
}
function jitter(rects, grid, amp, fixed, rng) {
  const owner = Array.from({ length: grid.rows }, () => new Array(grid.cols).fill(-1));
  rects.forEach((r2, i) => {
    for (let y = r2.row; y < r2.row + r2.h; y++) for (let x = r2.col; x < r2.col + r2.w; x++) owner[y][x] = i;
  });
  const free = (x, y) => x < 0 || y < 0 || x >= grid.cols || y >= grid.rows || owner[y][x] === -1;
  const clear = (x0, x1, y0, y1) => {
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (!free(x, y)) return false;
    return true;
  };
  const set = (x0, x1, y0, y1, v) => {
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) owner[y][x] = v;
  };
  rects.forEach((r2, i) => {
    if (i === fixed) return;
    for (const side of ["left", "right", "top", "bottom"]) {
      const d = Math.round((rng() * 2 - 1) * amp);
      if (d === 0) continue;
      const vertical = side === "left" || side === "right";
      const len = vertical ? r2.h : r2.w;
      let outer = true;
      for (let k = 0; k < len && outer; k++) {
        const x = side === "left" ? r2.col - 1 : side === "right" ? r2.col + r2.w : r2.col + k;
        const y = side === "top" ? r2.row - 1 : side === "bottom" ? r2.row + r2.h : r2.row + k;
        if (!free(x, y)) outer = false;
      }
      if (!outer) continue;
      const grow = Math.max(0, d);
      const shrink = Math.max(0, -d);
      if (shrink >= (vertical ? r2.w : r2.h)) continue;
      const x0 = r2.col;
      const x1 = r2.col + r2.w;
      const y0 = r2.row;
      const y1 = r2.row + r2.h;
      if (side === "left") {
        if (x0 - grow < 0 || !clear(x0 - grow, x0, y0, y1)) continue;
        set(x0 - grow, x0, y0, y1, i);
        set(x0, x0 + shrink, y0, y1, -1);
        r2.col += shrink - grow;
        r2.w += grow - shrink;
      } else if (side === "right") {
        if (x1 + grow > grid.cols || !clear(x1, x1 + grow, y0, y1)) continue;
        set(x1, x1 + grow, y0, y1, i);
        set(x1 - shrink, x1, y0, y1, -1);
        r2.w += grow - shrink;
      } else if (side === "top") {
        if (y0 - grow < 0 || !clear(x0, x1, y0 - grow, y0)) continue;
        set(x0, x1, y0 - grow, y0, i);
        set(x0, x1, y0, y0 + shrink, -1);
        r2.row += shrink - grow;
        r2.h += grow - shrink;
      } else {
        if (y1 + grow > grid.rows || !clear(x0, x1, y1, y1 + grow)) continue;
        set(x0, x1, y1, y1 + grow, i);
        set(x0, x1, y1 - shrink, y1, -1);
        r2.h += grow - shrink;
      }
    }
  });
}
function shuffled(list, rng) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function trimClearZone(m, z) {
  const area = z.w * z.h;
  const ring = [];
  for (let r2 = z.row; r2 < z.row + z.h; r2++) {
    for (let c = z.col; c < z.col + z.w; c++) {
      if (!m[r2]?.[c]) continue;
      const inRing2 = c - z.col < CLEAR_ZONE_RING_DEPTH || z.col + z.w - 1 - c < CLEAR_ZONE_RING_DEPTH || r2 - z.row < CLEAR_ZONE_RING_DEPTH || z.row + z.h - 1 - r2 < CLEAR_ZONE_RING_DEPTH;
      if (inRing2) ring.push([r2, c]);
      else m[r2][c] = false;
    }
  }
  if (ring.length > Math.floor(area * CLEAR_ZONE_MAX_OVERLAP)) for (const [r2, c] of ring) m[r2][c] = false;
}
function keepsAnchor(blocks, grid, family) {
  const bottom = blocks.some((b) => b.row + b.h === grid.rows);
  if (family === "rising") return bottom;
  if (family === "hanging") return !bottom && blocks.some((b) => b.row === 0);
  return !blocks.some((b) => b.col === 0);
}
function templatePattern(grid, rng, params, zoned, set4) {
  const count = Math.max(1, Math.floor(params.blockCount));
  if (count < 2) return null;
  const { slope, guidance, cornerMeetLimit } = params;
  const family = params.family ?? "auto";
  const set = params.referenceSet ?? 1;
  if (set4) delete set4.copied;
  const refs = shuffled(
    referencePatternsFor(set).filter((p) => p.slope === slope && (family === "auto" || p.family === family)),
    rng
  );
  if (refs.length === 0) return null;
  const tolerance = Math.max(2, Math.round(count * 0.2));
  const amp0 = (1 - guidance / 100) * JITTER_SHARE * Math.min(grid.cols, grid.rows);
  const floor = GUIDANCE_SIMILARITY_SHARE * guidance / 100;
  const goal = floor + GOAL_MARGIN;
  const bestPerRef = [];
  for (let attempt = 0; attempt < ATTEMPTS3; attempt++) {
    const refIndex = attempt % refs.length;
    const ref = refs[refIndex];
    const keeper = ref.source === "keeper";
    const mask = templateMask(ref.mask, grid, set);
    let cover = null;
    if (zoned?.mode === "clear") trimClearZone(mask, zoned.zone);
    if (zoned?.mode === "flat") {
      cover = zoned.covers[attempt % zoned.covers.length];
      for (let r2 = cover.row; r2 < cover.row + cover.h; r2++) {
        for (let c = cover.col; c < cover.col + cover.w; c++) mask[r2][c] = false;
      }
    }
    const base = decompose(mask);
    if (base.length + (cover ? 1 : 0) > count + tolerance) continue;
    for (const factor of [1, 0.5, 0]) {
      const rects = (cover ? [cover, ...base] : base).map((r2) => ({ ...r2 }));
      const fixed = cover ? 0 : -1;
      splitTo(rects, count, fixed, rng);
      if (factor > 0 && amp0 > 0.5) jitter(rects, grid, amp0 * factor, fixed, rng);
      const blocks = rects.map((r2, i) => ({ id: `block-${i + 1}`, ...r2, tint: 0 }));
      if (Math.abs(blocks.length - count) > tolerance) break;
      if (!checkPatternRules(blocks, grid).ok) continue;
      const covered = blocks.reduce((a, b) => a + b.w * b.h, 0) / (grid.cols * grid.rows);
      if (covered < COVERAGE_LIMIT[0]) continue;
      if (countCornerMeets(blocks).length > cornerMeetLimit) continue;
      if (family !== "auto" && !keepsAnchor(blocks, grid, family)) continue;
      if (!keeper && slopeShapeProblem(blocks, grid, slope)) continue;
      if (!keeper && !keepsGrowth(blocks, grid, slope)) continue;
      const z = zoned?.zone;
      const cornerInClearZone = zoned?.mode === "clear" && z.row === 0 && z.col + z.w === grid.cols;
      if (!keeper && slope === "75" && !cornerInClearZone && !blocks.some((b) => b.row === 0 && b.col + b.w === grid.cols)) continue;
      if (zoned?.mode === "clear" && !measureClearZoneOverlap({ textZone: zoned.zone, pattern: blocks }).withinLimit) {
        continue;
      }
      if (set4) {
        const userBroken = set4.userRules ? blockRuleProblem(blocks, set4.userRules) : null;
        if (userBroken) {
          set4.rejected[userBroken] = (set4.rejected[userBroken] ?? 0) + 1;
          continue;
        }
        const broken = set4RuleProblem({
          blocks: set4.expand ? set4.expand(blocks) : blocks,
          grid: set4.grid,
          slope,
          density: set4.density,
          referenceSet: set,
          // Under 'auto' the copy's own Reference tells the family (a mountain keeps only the lower trend edge).
          family: family === "auto" && ref.family === "mountain" ? "mountain" : family,
          keeperCopy: keeper
        });
        if (broken) {
          set4.rejected[broken]++;
          continue;
        }
      }
      const iou = patternSimilarity(blocks, grid, { slope, set, ...family === "auto" ? {} : { family } }).iou;
      if (iou >= goal && bestPerRef.slice(0, refIndex).every((b) => b === void 0)) {
        if (set4) set4.copied = ref;
        return blocks;
      }
      if (!bestPerRef[refIndex] || iou > bestPerRef[refIndex].iou) bestPerRef[refIndex] = { blocks, iou, ref };
    }
  }
  const found = bestPerRef.filter((b) => b !== void 0);
  if (found.length === 0) return null;
  const top = Math.max(...found.map((b) => b.iou));
  const threshold = Math.min(floor, top - VARIETY_SPREAD);
  const chosen = found.find((b) => b.iou >= threshold);
  if (set4) set4.copied = chosen.ref;
  return chosen.blocks;
}

// packages/core/src/generator.ts
var BASE_BLOCK_SIZES = [1, 2, 3, 4, 6, 8];
var SLOPES2 = ["flat", "half", "75"];
var PATTERN_FAMILIES = ["auto", "rising", "hanging", "mountain"];
var TYPICAL_COLUMN_WIDTH = 4;
var TYPICAL_BLOCK_HEIGHT = 3;
var TARGET_COVERAGE = 0.45;
var MAX_BLOCK_COUNT = 400;
function typicalColumns(grid) {
  const minColumns = Math.ceil(grid.cols / BASE_BLOCK_SIZES[BASE_BLOCK_SIZES.length - 1]);
  return Math.max(grid.cols >= 6 ? 3 : 2, minColumns, Math.round(grid.cols / TYPICAL_COLUMN_WIDTH));
}
function defaultBlockCountFor(grid) {
  const half = halvedGrid(grid);
  if (half) return defaultBlockCountFor(half);
  const perColumn = Math.max(1, Math.round(TARGET_COVERAGE * grid.rows / TYPICAL_BLOCK_HEIGHT));
  return Math.max(MIN_DEFAULT_BLOCK_COUNT, Math.min(MAX_BLOCK_COUNT / 2, typicalColumns(grid) * perColumn));
}
var MIN_DEFAULT_BLOCK_COUNT = 3;
var HALVE_FROM = 32;
function halvedGrid(grid) {
  if (Math.min(grid.cols, grid.rows) < HALVE_FROM) return null;
  return {
    cols: Math.ceil(grid.cols / 2),
    rows: Math.ceil(grid.rows / 2),
    cellW: grid.cellW * 2,
    cellH: grid.cellH * 2,
    ...grid.cellPx !== void 0 ? { cellPx: grid.cellPx * 2 } : {}
  };
}
function halveZone(zone) {
  const col = Math.floor(zone.col / 2);
  const row = Math.floor(zone.row / 2);
  return { ...zone, col, row, w: Math.ceil((zone.col + zone.w) / 2) - col, h: Math.ceil((zone.row + zone.h) / 2) - row };
}
function doubleBlocks(blocks, grid) {
  return blocks.map((b) => {
    const col = b.col * 2;
    const row = b.row * 2;
    return { ...b, col, row, w: Math.min(b.w * 2, grid.cols - col), h: Math.min(b.h * 2, grid.rows - row) };
  }).filter((b) => b.w > 0 && b.h > 0);
}
function blockCountRangeFor(grid) {
  return { min: 1, max: Math.min(MAX_BLOCK_COUNT, Math.max(4, 2 * defaultBlockCountFor(grid))) };
}
var DEFAULT_GUIDANCE = 90;
function defaultGeneratorParams(grid) {
  return { slope: "half", blockCount: defaultBlockCountFor(grid), cornerMeetLimit: 2, guidance: DEFAULT_GUIDANCE, referenceSet: LATEST_REFERENCE_SET };
}
var MAX_CORNER_MEET_LIMIT = 10;
function validateGeneratorParams(p, freeShape = p.freeShape !== void 0) {
  if (p.slope !== void 0 && !SLOPES2.includes(p.slope)) {
    return `slope must be one of ${SLOPES2.join(", ")}.`;
  }
  if (p.blockCount !== void 0 && !(Number.isInteger(p.blockCount) && p.blockCount >= 1 && (freeShape || p.blockCount <= MAX_BLOCK_COUNT))) {
    return `blockCount must be an integer from 1 to ${MAX_BLOCK_COUNT}.`;
  }
  if (p.cornerMeetLimit !== void 0 && !(Number.isInteger(p.cornerMeetLimit) && p.cornerMeetLimit >= 0 && (freeShape || p.cornerMeetLimit <= MAX_CORNER_MEET_LIMIT))) {
    return `cornerMeetLimit must be an integer from 0 to ${MAX_CORNER_MEET_LIMIT}.`;
  }
  if (p.guidance !== void 0 && !(Number.isInteger(p.guidance) && p.guidance >= 0 && p.guidance <= 100)) {
    return "guidance must be an integer from 0 to 100.";
  }
  if (p.family !== void 0 && !PATTERN_FAMILIES.includes(p.family)) {
    return `family must be one of ${PATTERN_FAMILIES.join(", ")}.`;
  }
  if (p.freeShape !== void 0) {
    const problem = validateFreeShape(p.freeShape);
    if (problem) return problem;
  }
  if (p.referenceSet !== void 0 && !(Number.isInteger(p.referenceSet) && p.referenceSet >= 1 && p.referenceSet <= UNRELEASED_REFERENCE_SET)) {
    return `referenceSet must be an integer from 1 to ${UNRELEASED_REFERENCE_SET}.`;
  }
  return null;
}
function generatorBlockSizesFor(grid) {
  const k = halvedGrid(grid) ? 2 : 1;
  return {
    w: BASE_BLOCK_SIZES.map((s) => s * k).filter((s) => s <= grid.cols),
    h: BASE_BLOCK_SIZES.map((s) => s * k).filter((s) => s <= grid.rows)
  };
}
var RISE = {
  flat: [0.2, 0.5],
  half: [0.18, 0.65],
  "75": [0.15, 0.95]
};
var BAND_THICKNESS = { flat: 0.2, half: 0.38, "75": 0.4 };
var PREFERRED_COVERAGE2 = [0.3, 0.6];
var HANGING_SHARE = 0.22;
var MOUNTAIN_SHARE = 0.1;
var HANG_RISE = {
  flat: [0.7, 1],
  half: [0.5, 1],
  "75": [0.3, 1]
};
var MOUNTAIN_RISE = {
  flat: [0.55, 1],
  half: [0.4, 1],
  "75": [0.4, 1]
};
var HANG_THICKNESS = { flat: 0.3, half: 0.38, "75": 0.4 };
var MIN_VARIANT_SIDE = 8;
var skylineBuilds = (grid) => grid.cols >= MIN_VARIANT_SIDE && grid.rows >= MIN_VARIANT_SIDE;
function coverageFloor(grid, count) {
  if (count <= 2) return 0;
  const maxArea = BASE_BLOCK_SIZES[BASE_BLOCK_SIZES.length - 1] ** 2;
  return Math.min(COVERAGE_LIMIT[0], 0.5 * count * maxArea / (grid.cols * grid.rows));
}
var PASSES = [
  [1, 40],
  [0.7, 20],
  [0.5, 20],
  [0.3, 20]
];
var GUIDANCE_PENALTY = 1e3;
var GUIDANCE_ATTEMPTS = 16;
var FREE_UNTIL = TEMPLATE_FROM;
function freedomFor(guidance, referenceSet) {
  if (usesSet4Rules(referenceSet)) return 0;
  return Math.min(1, Math.max(0, 1 - guidance / FREE_UNTIL));
}
var FREE_VARIANT_SHARE = 0.1;
var MIN_BLOCK_HEIGHT = 2.5;
function rectsTrend(rects) {
  return trendDegrees(rects.map((r2) => [r2.x + r2.w / 2, r2.y0 + r2.h / 2]));
}
function nearest(list, v) {
  let best = list[0];
  for (const x of list) if (Math.abs(x - v) < Math.abs(best - v)) best = x;
  return best;
}
function feasibility(sizes, limit) {
  if (sizes.length === BASE_BLOCK_SIZES.length && sizes.every((z, i) => z === BASE_BLOCK_SIZES[i])) {
    return (sum, parts) => parts === 0 ? sum === 0 : parts > 0 && sum >= parts && sum <= 8 * parts && sum !== 8 * parts - 1 && sum !== 8 * parts - 3;
  }
  const table = Array.from({ length: limit + 1 }, () => new Array(limit + 1).fill(false));
  table[0][0] = true;
  for (let sum = 1; sum <= limit; sum++) {
    for (let parts = 1; parts <= limit; parts++) {
      table[sum][parts] = sizes.some((z) => z <= sum && table[sum - z][parts - 1]);
    }
  }
  return (sum, parts) => table[sum]?.[parts] ?? false;
}
function partRange(feas, len, maxSize) {
  let lo = Math.ceil(len / maxSize);
  while (lo < len && !feas(len, lo)) lo++;
  return [lo, len];
}
function composeWidths(cols, k, widths, wfeas, rng, noise = 0.3) {
  let total = cols;
  while (total > 0 && !wfeas(total, k)) total--;
  if (total === 0) return null;
  const out = [];
  for (let left = k; left > 0; left--) {
    const options = widths.filter((w2) => w2 <= total && wfeas(total - w2, left - 1)).map((w2) => ({ w: w2, key: Math.abs(w2 - total / left) + rng() * (total / left) * noise })).sort((a, b) => a.key - b.key);
    const w = options[0].w;
    out.push(w);
    total -= w;
  }
  return out;
}
function hitsObstacle(r2, o) {
  return !!o && r2.x < o.x1 && o.x0 < r2.x + r2.w && r2.y0 < o.y1 && o.y0 < r2.y0 + r2.h;
}
function decompose2(ctx, len, parts, y0, avoid, rng) {
  let best = [];
  let bestConflicts = Infinity;
  for (let t = 0; t < 8 && bestConflicts > 0; t++) {
    const seq = [];
    let remaining = len;
    for (let p = parts; p > 0; p--) {
      const feasible = ctx.sizes.h.filter((z2) => z2 <= remaining && ctx.feas(remaining - z2, p - 1));
      const clean = feasible.filter((z2) => z2 === remaining || !avoid.has(y0 + len - remaining + z2));
      let options = clean.length > 0 ? clean : feasible;
      if (ctx.free > 0 && ctx.grid.rows >= MIN_VARIANT_SIDE) {
        const noSliver = (o) => o > 1 && remaining - o >= 2 * (p - 1);
        const pool = [options, clean, feasible].map((l) => l.filter(noSliver)).find((l) => l.length > 0);
        if (pool) options = pool;
      }
      const even = remaining / p;
      let z = options[0];
      let zKey = Infinity;
      for (const o of options) {
        const key = Math.abs(o - even) + rng() * even * 0.6;
        if (key < zKey) {
          zKey = key;
          z = o;
        }
      }
      seq.push(z);
      remaining -= z;
    }
    let y = y0;
    let conflicts = 0;
    for (let i = 0; i < seq.length - 1; i++) {
      y += seq[i];
      if (avoid.has(y)) conflicts++;
    }
    if (conflicts < bestConflicts) {
      bestConflicts = conflicts;
      best = seq;
    }
  }
  return best;
}
function buildSkyline(ctx, rng) {
  const { cols, rows } = ctx.grid;
  const { count, band, shadow, feas } = ctx;
  const minH = ctx.sizes.h[0];
  const spread = 1 + Math.round(ctx.free);
  const kWanted = typicalColumns(ctx.grid) + Math.floor(rng() * (2 * spread + 1)) - spread;
  const span = cols - ctx.inset.left - ctx.inset.right;
  const kMin = Math.ceil(span / ctx.sizes.w[ctx.sizes.w.length - 1]);
  const kStart = Math.min(span, Math.max(2, kMin, Math.min(kWanted, shadow ? Math.floor(count / 3) : count)));
  const kLow = Math.max(2, kMin);
  const order = [];
  for (let d = 0; d <= span; d++) {
    for (const k2 of d === 0 ? [kStart] : [kStart + d, kStart - d]) {
      if (k2 >= kLow && k2 <= span) order.push(k2);
    }
  }
  let widths = null;
  const fw = ctx.freeWidths;
  if (fw) {
    for (const k2 of order) {
      if (!fw.wfeas(span, k2)) continue;
      widths = composeWidths(span, k2, fw.w, fw.wfeas, rng, 0.3 + 2 * ctx.free);
      if (widths) break;
    }
  }
  if (!widths) for (const k2 of order) {
    if (!ctx.wfeas(span, k2)) continue;
    widths = composeWidths(span, k2, ctx.sizes.w, ctx.wfeas, rng);
    if (widths) break;
  }
  if (!widths) {
    for (const k2 of order) {
      widths = composeWidths(span, k2, ctx.sizes.w, ctx.wfeas, rng);
      if (widths) break;
    }
  }
  if (!widths) return null;
  const ob0 = ctx.obstacle;
  const right = cols - ctx.inset.right;
  if (ob0 && (ctx.slope === "75" || ctx.pinTop) && ob0.x1 < right && ob0.x1 > right - widths[widths.length - 1]) {
    const lastW = Math.max(0, ...ctx.sizes.w.filter((w) => w <= right - ob0.x1));
    const restSpan = span - lastW;
    if (lastW > 0 && restSpan > 0) {
      for (const n of order.map((o) => o - 1).filter((n2) => n2 >= 1 && ctx.wfeas(restSpan, n2))) {
        const rest = composeWidths(restSpan, n, ctx.sizes.w, ctx.wfeas, rng);
        if (rest) {
          widths = [...rest, lastW];
          break;
        }
      }
    }
  }
  const k = widths.length;
  const [first, last] = (ctx.variant === "hanging" ? HANG_RISE : ctx.variant === "mountain" ? MOUNTAIN_RISE : RISE)[ctx.slope];
  const { gamma, first: dFirst, last: dLast } = ctx.profile;
  const from = Math.max(0.08, first + dFirst);
  const to = Math.min(1, Math.max(from + 0.1, last + dLast));
  const roughness = 0.06 + 0.12 * ctx.free;
  const upper = widths.map((_, i) => {
    const t = (k === 1 ? 1 : i / (k - 1)) ** gamma;
    return from + (to - from) * t + (rng() - 0.5) * roughness;
  });
  if (k >= 4 && ctx.slope !== "flat" && rng() < 0.5) {
    const j = 2 + Math.floor(rng() * (k - 2));
    upper[j] -= 0.06 + rng() * 0.1;
  }
  const thick = Math.max(
    (ctx.variant !== "rising" ? HANG_THICKNESS : BAND_THICKNESS)[ctx.slope] + (rng() - 0.5) * (0.1 + 0.2 * ctx.free),
    Math.min(0.6, count / k * MIN_BLOCK_HEIGHT / rows)
  );
  let x = cols - ctx.inset.right - widths.reduce((a, b) => a + b, 0);
  const xs = widths.map((w) => {
    const at = x;
    x += w;
    return at;
  });
  const meetsBetween2 = (left, right2) => {
    let m = 0;
    for (const a of left) {
      for (const b of right2) {
        if ((a.x + a.w === b.x || b.x + b.w === a.x) && (a.y0 + a.h === b.y0 || b.y0 + b.h === a.y0)) {
          m++;
        }
      }
    }
    return m;
  };
  const capRects = [];
  const mainRects = [];
  let prev = [];
  let used = 0;
  const wantedHeight = upper.map((u) => {
    const top = Math.max(minH, u * rows);
    return band ? Math.max(minH, Math.min(top, thick * rows)) : top;
  });
  const heightLeft = new Array(k + 1).fill(0);
  for (let i = k - 1; i >= 0; i--) heightLeft[i] = heightLeft[i + 1] + wantedHeight[i];
  for (let i = 0; i < k; i++) {
    const pinTop = (ctx.slope === "75" || ctx.pinTop) && i === k - 1;
    const topWanted = pinTop ? rows : Math.max(minH + ctx.lift, upper[i] * rows);
    let lowWanted = 0;
    if (band) lowWanted = topWanted - thick * rows;
    const maxLow = ctx.variant !== "rising" && prev.length > 0 ? Math.max(...prev.map((r2) => r2.y0 + r2.h)) - 1 : Infinity;
    lowWanted = Math.min(lowWanted, maxLow);
    let floor = ctx.lift;
    let ceil = rows;
    const ob = ctx.obstacle;
    if (ob && xs[i] < ob.x1 && ob.x0 < xs[i] + widths[i]) {
      const below = ob.y0 - ctx.lift >= minH;
      const above = rows - Math.max(ob.y1, ctx.lift) >= minH;
      if (!below && !above) {
        prev = [];
        continue;
      }
      const prevLow = Math.min(...prev.map((r2) => r2.y0));
      const prevTop = Math.max(...prev.map((r2) => r2.y0 + r2.h));
      const touchesBelow = prev.length === 0 || prevLow < ob.y0;
      const touchesAbove = prev.length === 0 || prevTop > Math.max(ob.y1, ctx.lift);
      const nearerBelow = Math.max(0, topWanted - ob.y0) <= Math.max(0, ob.y1 - topWanted);
      if (below && (!above || touchesBelow && (nearerBelow || !touchesAbove))) {
        ceil = ob.y0;
      } else {
        floor = Math.max(floor, ob.y1);
      }
    }
    const lows = lowWanted >= floor + minH / 2 ? [floor, ...ctx.lens.filter((l) => l >= floor && l <= ceil - minH)] : [floor];
    const avgHeight = Math.min(
      ctx.sizes.h[ctx.sizes.h.length - 1],
      Math.max(minH, heightLeft[i] / Math.max(1, count - used))
    );
    let bestCol = null;
    let bestScore = Infinity;
    let bestMeets = Infinity;
    for (let t = 0; t < 8 || bestMeets > 0 && t < 32; t++) {
      const pickedLow = lows.length === 1 ? floor : nearest(lows, lowWanted + (rng() - 0.5) * minH * 2);
      const low = Math.max(floor, Math.min(pickedLow, maxLow));
      const room = ctx.lens.filter((l) => l <= ceil - low);
      if (room.length === 0) continue;
      const ranked = [...room].sort(
        (a, b) => Math.abs(a - (topWanted - low)) - Math.abs(b - (topWanted - low))
      );
      const len = pinTop && ceil === rows && room.includes(rows - low) ? rows - low : ranked[Math.min(ranked.length - 1, Math.floor(rng() * rng() * (3 + t / 4)))];
      let cap = null;
      if (shadow) {
        const avail = ceil - (low + len);
        const h = Math.max(0, ...ctx.sizes.h.filter((z) => z <= Math.min(ctx.shadowHeight, avail)));
        if (h > 0) cap = { x: xs[i], y0: low + len, w: widths[i], h, tint: 1 };
      }
      const [lo, hi] = partRange(feas, len, ctx.sizes.h[ctx.sizes.h.length - 1]);
      const budget = Math.max(1, Math.round(len / avgHeight));
      let np = Math.min(hi, Math.max(lo, budget - (cap ? 1 : 0)));
      if (np > lo && rng() < 0.25 + 0.25 * ctx.free) np--;
      else if (np < hi && rng() < 0.25) np++;
      if (ctx.free > 0 && ctx.grid.rows >= MIN_VARIANT_SIDE) np = Math.max(lo, Math.min(np, Math.floor(len / 2)));
      const stack = decompose2(ctx, len, np, low, new Set(prevEdges(prev)), rng);
      const main = [];
      let y = low;
      for (const h of stack) {
        main.push({ x: xs[i], y0: y, w: widths[i], h, tint: 0 });
        y += h;
      }
      const col = cap ? [...main, cap] : main;
      const meets = meetsBetween2(prev, col);
      const score = meets * 1e3 + Math.abs(len + low - topWanted) + Math.abs(col.length - budget) * 3;
      if (score < bestScore) {
        bestScore = score;
        bestMeets = meets;
        bestCol = { main, cap };
      }
    }
    if (!bestCol) return null;
    mainRects.push(...bestCol.main);
    if (bestCol.cap) capRects.push(bestCol.cap);
    prev = bestCol.cap ? [...bestCol.main, bestCol.cap] : bestCol.main;
    used += prev.length;
  }
  return [...capRects, ...mainRects];
}
function prevEdges(col) {
  const ys = [];
  for (const r2 of col) ys.push(r2.y0, r2.y0 + r2.h);
  return ys;
}
function toBlocks(rects, grid, tintCount) {
  return rects.map((r2, i) => ({
    id: `block-${i + 1}`,
    col: r2.x,
    row: grid.rows - r2.y0 - r2.h,
    w: r2.w,
    h: r2.h,
    tint: Math.min(r2.tint, tintCount - 1)
  }));
}
function fallbackChain(grid, sizes, count, obstacle, cornerMeetLimit) {
  const fits = (r2) => r2.x >= 0 && r2.y0 >= 0 && r2.x + r2.w <= grid.cols && r2.y0 + r2.h <= grid.rows && !hitsObstacle(r2, obstacle);
  const onEdge = (r2) => r2.x === 0 || r2.y0 === 0 || r2.x + r2.w === grid.cols || r2.y0 + r2.h === grid.rows;
  const small = [sizes.w[0], sizes.h[0]];
  const mid = [sizes.w.includes(2) ? 2 : small[0], sizes.h.includes(2) ? 2 : small[1]];
  const options = mid[0] === small[0] && mid[1] === small[1] ? [small] : [mid, small];
  let first = null;
  for (const [w, h] of options) {
    let bestD = Infinity;
    for (let y0 = 0; y0 + h <= grid.rows; y0++) {
      for (let x = 0; x + w <= grid.cols; x++) {
        const r2 = { x, y0, w, h, tint: 0 };
        if (x + y0 < bestD && onEdge(r2) && fits(r2)) {
          first = r2;
          bestD = x + y0;
        }
      }
    }
    if (first) break;
  }
  if (!first) return [];
  const out = [first];
  const asBlocks = (rs) => rs.map((r2, i) => ({ id: `b${i}`, col: r2.x, row: grid.rows - r2.y0 - r2.h, w: r2.w, h: r2.h, tint: 0 }));
  while (out.length < count) {
    const prev = out[out.length - 1];
    let added = false;
    for (const [w, h] of options) {
      const cands = [
        { x: prev.x + prev.w, y0: prev.y0 + (prev.h >= 2 ? 1 : 0), w, h, tint: 0 },
        { x: prev.x + (prev.w >= 2 ? 1 : 0), y0: prev.y0 + prev.h, w, h, tint: 0 }
      ];
      const next = cands.find(
        (c) => fits(c) && !out.some((o) => c.x < o.x + o.w && o.x < c.x + c.w && c.y0 < o.y0 + o.h && o.y0 < c.y0 + c.h) && countCornerMeets(asBlocks([...out, c])).length <= cornerMeetLimit
      );
      if (next) {
        out.push(next);
        added = true;
        break;
      }
    }
    if (!added) break;
  }
  return out;
}
function skyline(grid, colourway, rng, params, obstacle, extra = [], lenient = false, blockRules = null) {
  const sizes = generatorBlockSizesFor(grid);
  const { slope, cornerMeetLimit } = params;
  const count = Math.max(1, Math.floor(params.blockCount));
  const tintCount = Math.max(1, colourway.tints.length);
  const feas = feasibility(sizes.h, grid.rows);
  const lens = Array.from({ length: grid.rows }, (_, i) => i + 1);
  let band = rng() < 0.5;
  const wantShadow = tintCount >= 2 && rng() < 0.55;
  const shadowHeights = sizes.h.filter((z) => z <= Math.max(sizes.h[0], Math.min(4, grid.rows / 4)));
  const roll = rng();
  const free = freedomFor(params.guidance, params.referenceSet);
  const hangingShare = HANGING_SHARE + FREE_VARIANT_SHARE * free;
  const mountainShare = MOUNTAIN_SHARE + FREE_VARIANT_SHARE * free;
  const roomy = grid.cols >= MIN_VARIANT_SIDE && grid.rows >= MIN_VARIANT_SIDE;
  const chosen = params.family ?? "auto";
  const variant = !roomy ? "rising" : chosen !== "auto" ? chosen === "mountain" && slope === "75" ? "rising" : chosen : roll < hangingShare ? "hanging" : roll < hangingShare + mountainShare && slope !== "75" ? "mountain" : "rising";
  const liftedMountain = variant === "mountain" && rng() < 0.5;
  const lift = variant === "hanging" || liftedMountain ? Math.max(1, Math.round(grid.rows * (0.1 + 0.1 * rng()))) : 0;
  if (lift > 0) band = true;
  const inset = variant === "mountain" ? {
    left: Math.max(1, Math.round(grid.cols * (0.15 + 0.12 * rng()))),
    right: Math.max(1, Math.round(grid.cols * (0.04 + 0.06 * rng())))
  } : { left: 0, right: 0 };
  const ctx = {
    grid,
    sizes,
    feas,
    wfeas: feasibility(sizes.w, grid.cols),
    lens,
    slope,
    count,
    band,
    shadow: wantShadow && count >= Math.max(6, 2 * Math.ceil(grid.cols / sizes.w[sizes.w.length - 1])),
    shadowHeight: shadowHeights[Math.floor(rng() * shadowHeights.length)],
    obstacle,
    lift,
    variant,
    pinTop: variant !== "rising",
    inset,
    free,
    // Drawn after everything above, so a Guidance without freedom keeps its rng() sequence.
    profile: free > 0 ? { gamma: 2 ** ((rng() * 2 - 1) * free), first: (rng() - 0.5) * 0.2 * free, last: (rng() - 0.5) * 0.2 * free } : { gamma: 1, first: 0, last: 0 },
    freeWidths: null
  };
  if (free > 0 && grid.cols >= MIN_VARIANT_SIDE) {
    const w = sizes.w.filter((z) => z >= (grid.cols >= 16 ? 3 : 2));
    ctx.freeWidths = { w, wfeas: feasibility(w, grid.cols) };
  }
  let best = null;
  let bestScore = Infinity;
  const area = grid.cols * grid.rows;
  const floor = coverageFloor(grid, count);
  const threshold = GUIDANCE_SIMILARITY_SHARE * params.guidance / 100;
  const guided = threshold > 0;
  let scored = 0;
  for (const flip of [false, true]) {
    ctx.band = flip ? !band : band;
    if (flip && variant !== "rising") {
      ctx.variant = "rising";
      ctx.lift = 0;
      ctx.pinTop = false;
      ctx.inset = { left: 0, right: 0 };
    }
    for (const [scale, attempts] of PASSES) {
      ctx.count = Math.max(1, Math.round(count * scale));
      for (let attempt = 0; attempt < attempts; attempt++) {
        const built = buildSkyline(ctx, rng);
        if (!built) {
          if (diag) diag.rejected.unbuilt++;
          continue;
        }
        const rects = built.filter((r2) => !hitsObstacle(r2, obstacle));
        if (rects.length === 0) {
          if (diag) diag.rejected.empty++;
          continue;
        }
        const trend = rectsTrend(rects);
        if (trend !== null && (slope === "flat" ? trend < 0 : trend <= 0)) {
          if (diag) diag.rejected.trend++;
          continue;
        }
        const blocks = toBlocks(rects, grid, tintCount);
        const shapeOk = !slopeShapeProblem(blocks, grid, slope);
        if (!shapeOk && diag) diag.rejected.shape++;
        const meets = countCornerMeets(blocks).length;
        if (meets > cornerMeetLimit) {
          if (diag) diag.rejected.cornerMeets++;
          continue;
        }
        const withExtra = extra.length > 0 ? toBlocks([...rects, ...extra], grid, tintCount) : blocks;
        const rules = checkPatternRules(withExtra, grid);
        const rulesOk = rules.ok && !(blockRules && blockRuleProblem(withExtra, blockRules));
        if (!rulesOk && diag) {
          diag.rejected.rules++;
          if (diag.ruleSamples.length < RULE_SAMPLES) {
            diag.ruleSamples.push({ violations: rules.violations, blocks: withExtra.map((b) => [b.col, b.row, b.w, b.h]) });
          }
        }
        if (!rulesOk && !lenient) continue;
        const covered = rects.reduce((a, r2) => a + r2.w * r2.h, 0) / area;
        const coverageErr = Math.max(0, PREFERRED_COVERAGE2[0] - covered, covered - PREFERRED_COVERAGE2[1]);
        const outOfLimit = covered < floor;
        const miss = Math.abs(count - rects.length);
        scored++;
        const sim = guided ? patternSimilarity(extra.length > 0 ? toBlocks([...rects, ...extra], grid, tintCount) : blocks, grid, { slope, set: params.referenceSet ?? 1, ...chosen === "auto" ? {} : { family: ctx.variant } }).iou : 0;
        const score = (rulesOk ? 0 : 5e4) + (shapeOk ? 0 : 2e4) + (outOfLimit ? 1e4 : 0) + miss * 100 + coverageErr * 100 + Math.max(0, threshold - sim) * GUIDANCE_PENALTY;
        if (score < bestScore) {
          best = rects;
          bestScore = score;
        }
        if (rulesOk && shapeOk && !outOfLimit && coverageErr === 0 && miss <= blockCountTolerance(count) && (sim >= threshold || scored >= GUIDANCE_ATTEMPTS)) {
          break;
        }
      }
      if (bestScore < 3e4) break;
    }
    if (bestScore < 1e4) break;
  }
  return best;
}
var MAX_COVER_SHARE = 0.6;
var MAX_COVER_TRIES = 8;
function toObstacle(zone, grid) {
  return {
    x0: zone.col,
    x1: zone.col + zone.w,
    y0: grid.rows - zone.row - zone.h,
    y1: grid.rows - zone.row
  };
}
function coverCandidates(zone, grid, sizes) {
  const fit = (list, need) => {
    const ok = list.filter((s) => s >= need).slice(0, 2);
    return ok.length > 0 ? ok : [need];
  };
  const spans = (pos, len, size, max) => {
    const lo = Math.max(0, pos + len - size);
    const hi = Math.min(pos, max - size);
    return [.../* @__PURE__ */ new Set([lo, hi, Math.floor((lo + hi) / 2)])];
  };
  const out = [];
  const pairs = fit(sizes.w, zone.w).flatMap((w) => fit(sizes.h, zone.h).map((h) => ({ w, h })));
  pairs.sort((a, b) => a.w * a.h - b.w * b.h);
  for (const { w, h } of pairs) {
    for (const col of spans(zone.col, zone.w, w, grid.cols)) {
      for (const row of spans(zone.row, zone.h, h, grid.rows)) {
        out.push({ x: col, y0: grid.rows - row - h, w, h, tint: 0 });
      }
    }
  }
  return out;
}
var diag = null;
var RULE_SAMPLES = 3;
function bridgeToAnchor(blocks, anchor, grid, sizes) {
  const out = [...blocks];
  const cover = blocks[anchor];
  const hits = (p, list) => list.some((o) => p.col < o.col + o.w && o.col < p.col + p.w && p.row < o.row + o.h && o.row < p.row + p.h);
  const near = (p, list) => list.some((o) => p.col <= o.col + o.w && o.col <= p.col + p.w && p.row <= o.row + o.h && o.row <= p.row + p.h);
  const wp = Math.max(...sizes.w.filter((z) => z <= cover.w));
  const hp = Math.max(...sizes.h.filter((z) => z <= cover.h));
  for (let round2 = 0; round2 < 8; round2++) {
    const masses = patternMasses(out);
    if (masses.length <= 1) return out;
    const mine = masses.find((m) => m.includes(anchor));
    const strays = out.filter((_, i) => !mine.includes(i));
    const own = out.filter((_, i) => mine.includes(i) && i !== anchor);
    let best = null;
    for (const dir of ["down", "up", "right", "left"]) {
      for (let len = 1; len <= Math.max(grid.cols, grid.rows); len++) {
        const p = dir === "down" ? { col: cover.col, row: cover.row + cover.h, w: wp, h: len, vertical: true } : dir === "up" ? { col: cover.col, row: cover.row - len, w: wp, h: len, vertical: true } : dir === "right" ? { col: cover.col + cover.w, row: cover.row, w: len, h: hp, vertical: false } : { col: cover.col - len, row: cover.row, w: len, h: hp, vertical: false };
        if (p.col < 0 || p.row < 0 || p.col + p.w > grid.cols || p.row + p.h > grid.rows) break;
        if (hits(p, strays) || hits(p, own)) break;
        if (near(p, strays)) {
          if (!best || p.w * p.h < best.w * best.h) best = p;
          break;
        }
      }
    }
    if (!best) return null;
    const list = best.vertical ? sizes.h : sizes.w;
    let left = best.vertical ? best.h : best.w;
    let at = best.vertical ? best.row : best.col;
    while (left > 0) {
      const z = Math.max(...list.filter((x) => x <= left));
      out.push({
        id: `block-${out.length + 1}`,
        col: best.vertical ? best.col : at,
        row: best.vertical ? at : best.row,
        w: best.vertical ? best.w : z,
        h: best.vertical ? z : best.h,
        tint: 0
      });
      at += z;
      left -= z;
    }
  }
  return null;
}
function arrangeAroundCover(grid, colourway, rng, params, cover, tintCount, blockRules = null) {
  const rects = skyline(
    grid,
    colourway,
    rng,
    params,
    { x0: cover.x, x1: cover.x + cover.w, y0: cover.y0, y1: cover.y0 + cover.h },
    [{ ...cover, tint: 0 }],
    true,
    blockRules
  );
  const blocks = toBlocks([...rects ?? [], { ...cover, tint: 0 }], grid, tintCount);
  const kept = (b) => b && checkPatternRules(b, grid).ok && !(blockRules && blockRuleProblem(b, blockRules)) ? b : null;
  const direct = kept(blocks);
  if (direct) return direct;
  const bridged = bridgeToAnchor(blocks, blocks.length - 1, grid, generatorBlockSizesFor(grid));
  const bridgedKept = kept(bridged);
  if (bridgedKept) return bridgedKept;
  return kept(repairPatternRules(blocks, grid, /* @__PURE__ */ new Set([blocks.length - 1])));
}
function generatePatternDetailed(grid, colourway, rng, params, options = {}) {
  if (params.freeShape && !options.textZone) return generateFreeShape(grid, params, params.freeShape, (params.variation ?? DEFAULT_VARIATION) / 100, rng, options.diagnostics);
  const rules = options.blockRules ?? blockRulesFor(params, options.density);
  const half = halvedGrid(grid);
  if (half) {
    const built2 = generatePatternDetailed(half, colourway, rng, params, {
      ...options.textZone ? { textZone: halveZone(options.textZone) } : {},
      ...options.diagnostics ? { diagnostics: options.diagnostics } : {},
      // The half-size Blocks have a quarter of the area once doubled.
      ...rules ? { blockRules: scaledBlockRules(rules, 4) } : {},
      ...options.density ? { density: options.density } : {},
      finalGrid: grid
    });
    const blocks = doubleBlocks(built2.blocks, grid);
    const zone = options.textZone;
    const zoneOk = !zone || measureClearZoneOverlap({ pattern: blocks, textZone: zone }).withinLimit;
    if (zoneOk && checkPatternRules(blocks, grid).ok && !(rules && blockRuleProblem(blocks, rules))) return { ...built2, blocks };
  }
  const out = options.diagnostics;
  const set4 = set4CheckFor(params, options, grid, rules);
  const built = !out ? generateDetailed(grid, colourway, rng, params, options, null, rules, set4) : diagnosed(out);
  if (options.textZone?.mode === "flat") return built;
  const met = maybeAddCornerMeet(built.blocks, grid, rng, params.cornerMeetLimit, params.slope);
  return { ...built, blocks: keepCornerMeet(built.blocks, met, rules, set4, params, built.family) };
  function diagnosed(d) {
    d.rejected = { unbuilt: 0, empty: 0, trend: 0, cornerMeets: 0, rules: 0, shape: 0 };
    d.ruleSamples = [];
    diag = d;
    try {
      return generateDetailed(grid, colourway, rng, params, options, d, rules, set4);
    } finally {
      diag = null;
    }
  }
}
function generateFreeShape(grid, params, group, variation, rng, out) {
  const account = out ? out.freeShape = { attempts: 0, rejected: {} } : void 0;
  if (out) out.path = "freeShape";
  const ask = {
    count: params.blockCount,
    ...params.blockCount === defaultBlockCountFor(grid) ? { defaultCount: true } : {},
    cornerMeetLimit: params.cornerMeetLimit,
    ...params.smallestBlock === void 0 ? {} : { smallestBlock: params.smallestBlock },
    ...params.blockProportion === void 0 ? {} : { blockProportion: params.blockProportion }
  };
  const noise = freeShapeNoise(group, variation, grid.cols, rng);
  const half = halvedGrid(grid);
  if (half && columnsFitHalf(group, half)) {
    const halfAsk = { ...ask, ...ask.smallestBlock === void 0 ? {} : { smallestBlock: Math.ceil(ask.smallestBlock / 4) } };
    const built = drawFreeShape(half, group, rng, halfAsk, account, noise);
    if (!built.failure) {
      const blocks = doubleBlocks(built.blocks, grid);
      if (checkPatternRules(blocks, grid).ok && !blockRuleProblem(blocks, freeShapeRules(ask)) && countCornerMeets(blocks).length <= ask.cornerMeetLimit) return { blocks: flipFreeShape(blocks, grid, group), flatFallback: false };
    }
  }
  const drawn = drawFreeShape(grid, group, rng, ask, account, noise);
  return drawn.failure ? { blocks: [], flatFallback: false, freeShapeFailure: drawn.failure } : { blocks: flipFreeShape(drawn.blocks, grid, group), flatFallback: false };
}
function keepCornerMeet(built, met, rules, set4, params, drawn) {
  const breaksARule = rules && blockRuleProblem(met, rules) || set4 && set4Problem(set4, met, params, drawn) !== null;
  return breaksARule ? built : met;
}
function set4CheckFor(params, options, grid, rules) {
  if (!usesSet4Rules(params.referenceSet) || !options.density) return void 0;
  const finalGrid = options.finalGrid ?? grid;
  return {
    density: options.density,
    grid: finalGrid,
    ...options.finalGrid ? { expand: (b) => doubleBlocks(b, finalGrid) } : {},
    rejected: { smallBlock: 0, trend: 0 },
    // The user's own Smallest Block and Block proportion bind a Reference copy too (spec #86); unset, the copy is asked only the signed rules.
    ...rules && setsABlockSetting(params) ? { userRules: rules } : {}
  };
}
function set4Problem(set4, blocks, params, drawn) {
  const family = drawn ?? (params.family && params.family !== "auto" ? params.family : "mountain");
  return set4RuleProblem({
    blocks: set4.expand ? set4.expand(blocks) : blocks,
    grid: set4.grid,
    slope: params.slope,
    density: set4.density,
    referenceSet: params.referenceSet,
    family,
    keeperCopy: set4.copied?.source === "keeper"
  });
}
function generateDetailed(grid, colourway, rng, params, options, out, rules, set4) {
  const zone = options.textZone;
  const took = (path, result) => {
    if (out) out.path = path;
    return result;
  };
  const tintCount = Math.max(1, colourway.tints.length);
  const sizes = generatorBlockSizesFor(grid);
  const count = Math.max(1, Math.floor(params.blockCount));
  const around = (obstacle, drawn = params) => {
    const rects = skyline(grid, colourway, rng, drawn, obstacle, [], false, rules) ?? [];
    const blocks = toBlocks(rects, grid, tintCount);
    if (rects.length > 0 && checkPatternRules(blocks, grid).ok) return took("skyline", blocks);
    return took("fallback", toBlocks(fallbackChain(grid, sizes, count, obstacle, params.cornerMeetLimit), grid, tintCount));
  };
  const family = params.family ?? "auto";
  const skylineLacks = family !== "auto" && family !== "rising" && !skylineBuilds(grid);
  const useTemplate = count >= 2 && (skylineLacks || params.guidance > TEMPLATE_FROM && rng() < templateChance(params.guidance));
  if (useTemplate) {
    const covers = zone?.mode === "flat" ? coverCandidates(zone, grid, sizes).filter((c) => c.w * c.h / (grid.cols * grid.rows) <= MAX_COVER_SHARE).slice(0, MAX_COVER_TRIES).map((c) => ({ col: c.x, row: grid.rows - c.y0 - c.h, w: c.w, h: c.h })) : [];
    const zoned = !zone ? null : zone.mode === "clear" ? { mode: "clear", zone } : covers.length > 0 ? { mode: "flat", zone, covers } : void 0;
    const blocks = zoned === void 0 ? null : templatePattern(grid, rng, params, zoned, set4);
    if (out && set4) {
      out.set4Rejected = {
        smallBlock: (out.set4Rejected?.smallBlock ?? 0) + set4.rejected.smallBlock,
        trend: (out.set4Rejected?.trend ?? 0) + set4.rejected.trend,
        ...set4.rejected.proportion ? { proportion: (out.set4Rejected?.proportion ?? 0) + set4.rejected.proportion } : {}
      };
    }
    if (blocks && out && set4?.copied) out.copiedSource = set4.copied.source;
    if (blocks) return took("template", { blocks, flatFallback: false, template: true });
  }
  if (rules && set4 && formulaApplies(params, count)) {
    const covers = zone?.mode === "flat" ? coverCandidates(zone, grid, sizes).filter((c) => c.w * c.h / (grid.cols * grid.rows) <= MAX_COVER_SHARE).slice(0, MAX_COVER_TRIES).map((c) => ({ col: c.x, row: grid.rows - c.y0 - c.h, w: c.w, h: c.h })) : [];
    const variant = formulaVariant(grid, params, rng);
    const diagnostics = out ? out.formula = newFormulaDiagnostics() : void 0;
    const drawn = drawFormula(
      {
        grid,
        slope: params.slope,
        family: variant,
        count,
        cornerMeetLimit: params.cornerMeetLimit,
        rules,
        // The rules of #95, asked of the full-size Blocks (an Extra fine Pattern is doubled first).
        set4Problem: (blocks) => set4Problem(set4, blocks, params, variant),
        ...params.shape ? { shape: params.shape } : {},
        ...params.variation !== void 0 ? { variation: params.variation } : {},
        ...zone ? { zone: { area: { col: zone.col, row: zone.row, w: zone.w, h: zone.h }, ...covers.length > 0 ? { covers } : {} } } : {}
      },
      rng,
      diagnostics
    );
    if (drawn) return took("formula", { blocks: drawn, flatFallback: zone?.mode === "flat" && covers.length === 0, family: variant });
    if (!zone) {
      return {
        blocks: took("fallback", toBlocks(fallbackChain(grid, sizes, count, null, params.cornerMeetLimit), grid, tintCount)),
        flatFallback: false,
        family: "rising"
      };
    }
  }
  if (!zone) return { blocks: around(null), flatFallback: false };
  if (zone.mode === "flat") {
    const cands = coverCandidates(zone, grid, sizes).filter(
      (c) => c.w * c.h / (grid.cols * grid.rows) <= MAX_COVER_SHARE
    );
    let best = null;
    for (const cover of cands.slice(0, MAX_COVER_TRIES)) {
      const blocks = arrangeAroundCover(grid, colourway, rng, params, cover, tintCount, rules);
      if (!blocks) continue;
      const meets = countCornerMeets(blocks).length;
      if (!best || meets < best.meets) best = { blocks, meets };
      if (meets <= params.cornerMeetLimit) break;
    }
    if (best) return took("flatCover", { blocks: best.blocks, flatFallback: false });
  }
  return { blocks: around(toObstacle(zone, grid)), flatFallback: zone.mode === "flat" };
}
function formulaVariant(grid, params, rng) {
  const chosen = params.family ?? "auto";
  if (!skylineBuilds(grid)) return "rising";
  if (chosen !== "auto") return chosen === "mountain" && params.slope === "75" ? "rising" : chosen;
  const roll = rng();
  if (roll < HANGING_SHARE) return "hanging";
  return roll < HANGING_SHARE + MOUNTAIN_SHARE && params.slope !== "75" ? "mountain" : "rising";
}
function generatePattern(grid, colourway, rng, params, options = {}) {
  return generatePatternDetailed(grid, colourway, rng, params, options).blocks;
}
function isValidBlockSize(size, gridSide) {
  return Number.isInteger(size) && size >= 1 && size <= gridSide;
}

// packages/core/src/articleCover.ts
var HIGHLIGHT_COLOURS = ["yellow", "green", "blue", "purple", "red", "orange", "white"];
var ARTICLE_COVER_FORMAT = (() => {
  const level = densityLevelsFor("link-1-91").find((l) => l.cols === 32 && l.rows === 16);
  return { format: "link-1-91", density: level.level };
})();
var holdsArticleCover = (doc) => doc.pages.some((p) => p.layout === "article-cover");
function articleCoverDocumentProblem(doc) {
  if (!holdsArticleCover(doc)) return null;
  if (doc.pages.length !== 1) return "An Article cover is a one-Page Document";
  const grid = gridFor(doc);
  if (doc.format !== ARTICLE_COVER_FORMAT.format || grid.cols !== 32 || grid.rows !== 16) {
    return "An Article cover is always Link preview 1.91:1 at the 32x16 Grid";
  }
  if (doc.transparentBackground) return "An Article cover is drawn on navy, so its background cannot be transparent";
  return null;
}
var COLOUR_PHOTO_REFUSED = {
  code: "photo.colourNotAllowed",
  message: "A colour photo is only for an Article cover. Every other layout takes a black-and-white photo."
};
function colourPhotoProblem(doc) {
  const bad = doc.pages.findIndex((p) => p.content?.photo?.colour && p.layout !== "article-cover");
  return bad < 0 ? null : `Page ${bad} holds a colour photo, which only an Article cover takes`;
}
var PHOTO_EDGES = ["fade", "step"];
var DEFAULT_PHOTO_EDGE = "fade";
var FADE_DIRECTIONS = ["left", "bottom", "full"];
var DEFAULT_FADE_DIRECTION = "left";
var FADE_LENGTH_RANGE = { min: 6, max: 14 };
var DEFAULT_FADE_LENGTH = 10;
var DEFAULT_LOW_FADE_LENGTH = 6;
var defaultFadeLength = (direction) => direction === "bottom" ? DEFAULT_LOW_FADE_LENGTH : DEFAULT_FADE_LENGTH;
var fadeRampCells = (length, extent) => Math.min(length, extent);
function articleCoverSettings(page) {
  const fadeDirection = page.articleCover?.fadeDirection ?? DEFAULT_FADE_DIRECTION;
  return {
    highlight: page.articleCover?.highlight ?? "yellow",
    photoEdge: page.articleCover?.photoEdge ?? DEFAULT_PHOTO_EDGE,
    fadeLength: page.articleCover?.fadeLength ?? defaultFadeLength(fadeDirection),
    fadeDirection
  };
}
var invalid = (message) => ({ code: "articleCover.invalid", message });
function articleCoverProblem(settings) {
  if (typeof settings !== "object" || settings === null || Array.isArray(settings)) {
    return invalid("Article cover settings must be an object.");
  }
  for (const [key, value] of Object.entries(settings)) {
    if (key === "highlight") {
      if (!HIGHLIGHT_COLOURS.includes(value)) {
        return invalid(`The Highlight colour must be one of ${HIGHLIGHT_COLOURS.join(", ")}; got ${JSON.stringify(value)}.`);
      }
    } else if (key === "photoEdge") {
      if (!PHOTO_EDGES.includes(value)) {
        return invalid(`The Photo edge must be one of ${PHOTO_EDGES.join(", ")}; got ${JSON.stringify(value)}.`);
      }
    } else if (key === "fadeLength") {
      const { min, max } = FADE_LENGTH_RANGE;
      if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
        return invalid(`The fade length must be a whole number of cells from ${min} to ${max}; got ${JSON.stringify(value)}.`);
      }
    } else if (key === "fadeDirection") {
      if (!FADE_DIRECTIONS.includes(value)) {
        return invalid(`The fade direction must be one of ${FADE_DIRECTIONS.join(", ")}; got ${JSON.stringify(value)}.`);
      }
    } else {
      return invalid(`Unknown Article cover setting: ${key}`);
    }
  }
  return null;
}
function stepEdgeCuts(slot, length, edge = { axis: "x", start: slot.col }) {
  const bands = 4;
  const cuts = [];
  if (edge.axis === "y") {
    const len2 = fadeRampCells(length, edge.start - slot.row);
    for (let band = 0; band < bands; band++) {
      const col = slot.col + Math.round(band * slot.w / bands);
      const end = slot.col + Math.round((band + 1) * slot.w / bands);
      const h = Math.round(len2 * band / (bands - 1));
      if (h > 0 && end > col) cuts.push({ col, row: edge.start - h, w: end - col, h });
    }
    return cuts;
  }
  const len = fadeRampCells(length, slot.col + slot.w - edge.start);
  for (let band = 0; band < bands; band++) {
    const row = slot.row + Math.round(band * slot.h / bands);
    const end = slot.row + Math.round((band + 1) * slot.h / bands);
    const w = edge.start - slot.col + Math.round(len * (bands - 1 - band) / (bands - 1));
    if (w > 0 && end > row) cuts.push({ col: slot.col, row, w, h: end - row });
  }
  return cuts;
}
var ARTICLE_COVER_FILLS = { background: BRAND_COLOURS.navy[100], tints: [BRAND_COLOURS.navy[75]] };
function pageFills(doc, pageIndex) {
  if (doc.pages[pageIndex]?.layout === "article-cover") return ARTICLE_COVER_FILLS;
  const colourway = getColourway(doc.colourway) ?? getColourway(DEFAULT_COLOURWAY_ID);
  return { background: colourway.background, tints: colourway.tints };
}
function tintFill(fills, tint) {
  const count = fills.tints.length;
  const i = count > 0 ? (tint % count + count) % count : 0;
  return fills.tints[i] ?? fills.background;
}
var highlightHex = (colour) => BRAND_COLOURS[colour][100];

// packages/core/src/content.ts
var MAX_CONTENT_TEXT = 1e3;
var TEXT_KEYS = ["headline", "secondary", "label"];
var CONTENT_KEYS = /* @__PURE__ */ new Set([...TEXT_KEYS, "ticker", "logo", "photo"]);
var PATCH_KEYS = /* @__PURE__ */ new Set([...TEXT_KEYS, "ticker", "logo"]);
var TICKER_KEYS = /* @__PURE__ */ new Set(["show", "left", "right"]);
var LOGO_KEYS = /* @__PURE__ */ new Set(["show"]);
var PHOTO_KEYS = /* @__PURE__ */ new Set(["src", "width", "height", "colour"]);
var IMAGE_DATA_URL = /^data:image\/(?!svg)[a-z0-9.+-]+(;[a-z0-9=._+-]+)*,.+/is;
var isRecord = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
function photoProblem(photo) {
  if (!isRecord(photo)) return { code: "photo.invalid", message: "A photo must be an object with src, width and height." };
  const extra = Object.keys(photo).find((k) => !PHOTO_KEYS.has(k));
  if (extra) return { code: "photo.invalid", message: `Unexpected property in photo: '${extra}'` };
  if (typeof photo.src !== "string" || !IMAGE_DATA_URL.test(photo.src)) {
    return { code: "photo.notImageDataUrl", message: "The photo must be an image data URL (data:image/...)." };
  }
  const { width, height } = photo;
  if (typeof width !== "number" || typeof height !== "number" || !Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    return { code: "photo.invalidSize", message: "The photo width and height must be positive whole pixels." };
  }
  if (photo.colour !== void 0 && photo.colour !== true) {
    return { code: "photo.invalid", message: "A photo is in colour (colour: true) or, when the flag is absent, black and white." };
  }
  return null;
}
function textProblem(key, v) {
  if (typeof v !== "string") return { code: "content.invalid", message: `${key} must be text.` };
  if (v.length > MAX_CONTENT_TEXT) {
    return { code: "content.tooLong", message: `${key} is longer than ${MAX_CONTENT_TEXT} characters.` };
  }
  return null;
}
function nestedProblem(key, v, allowed, complete) {
  if (!isRecord(v)) return { code: "content.invalid", message: `${key} must be an object.` };
  for (const k of Object.keys(v)) {
    if (!allowed.has(k)) return { code: "content.invalid", message: `Unexpected property in ${key}: '${k}'` };
  }
  for (const k of allowed) {
    if (v[k] === void 0) {
      if (complete) return { code: "content.invalid", message: `${key}.${k} is required.` };
      continue;
    }
    if (k === "show") {
      if (typeof v.show !== "boolean") return { code: "content.invalid", message: `${key}.show must be true or false.` };
    } else {
      const p = textProblem(`${key}.${k}`, v[k]);
      if (p) return p;
    }
  }
  return null;
}
function contentProblem(raw) {
  if (!isRecord(raw)) return { code: "content.invalid", message: "Page content must be an object." };
  for (const k of Object.keys(raw)) {
    if (!CONTENT_KEYS.has(k)) return { code: "content.invalid", message: `Unexpected property in content: '${k}'` };
  }
  for (const k of TEXT_KEYS) {
    if (raw[k] !== void 0) {
      const p = textProblem(k, raw[k]);
      if (p) return p;
    }
  }
  if (raw.ticker !== void 0) {
    const p = nestedProblem("ticker", raw.ticker, TICKER_KEYS, true);
    if (p) return p;
  }
  if (raw.logo !== void 0) {
    const p = nestedProblem("logo", raw.logo, LOGO_KEYS, true);
    if (p) return p;
  }
  if (raw.photo !== void 0) return photoProblem(raw.photo);
  return null;
}
function contentPatchProblem(raw) {
  if (!isRecord(raw)) return { code: "content.invalid", message: "Page content must be an object." };
  if (raw.photo !== void 0) {
    return { code: "content.photoNotAllowed", message: "Set the photo with setPhoto, not setPageContent." };
  }
  for (const k of Object.keys(raw)) {
    if (!PATCH_KEYS.has(k)) return { code: "content.invalid", message: `Unexpected property in content: '${k}'` };
  }
  for (const k of TEXT_KEYS) {
    if (raw[k] !== void 0) {
      const p = textProblem(k, raw[k]);
      if (p) return p;
    }
  }
  if (raw.ticker !== void 0) {
    const p = nestedProblem("ticker", raw.ticker, TICKER_KEYS, false);
    if (p) return p;
  }
  if (raw.logo !== void 0) {
    const p = nestedProblem("logo", raw.logo, LOGO_KEYS, false);
    if (p) return p;
  }
  return null;
}
function cleanContent(content) {
  const out = {};
  for (const k of TEXT_KEYS) {
    const v = content[k];
    if (v !== void 0 && v !== "") out[k] = v;
  }
  if (content.ticker) out.ticker = { show: content.ticker.show, left: content.ticker.left, right: content.ticker.right };
  if (content.logo) out.logo = { show: content.logo.show };
  if (content.photo) {
    out.photo = {
      src: content.photo.src,
      width: content.photo.width,
      height: content.photo.height,
      ...content.photo.colour ? { colour: true } : {}
    };
  }
  return Object.keys(out).length > 0 ? out : void 0;
}
function mergeContent(base, patch) {
  const next = { ...base };
  for (const k of TEXT_KEYS) {
    if (patch[k] !== void 0) next[k] = patch[k];
  }
  if (patch.ticker) {
    next.ticker = { show: false, left: "", right: "", ...base?.ticker, ...patch.ticker };
  }
  if (patch.logo) {
    next.logo = { show: true, ...base?.logo, ...patch.logo };
  }
  return cleanContent(next);
}
function withoutPhoto(content) {
  if (!content?.photo) return content;
  const { photo: _photo, ...rest } = content;
  return cleanContent(rest);
}
function contentAllowedOn(layout, content) {
  return content?.photo?.colour && layout !== "article-cover" ? withoutPhoto(content) : content;
}

// packages/core/src/pages.ts
function pageSeed(doc, index) {
  return doc.pages[index]?.seed ?? (index === 0 ? doc.seed : `${doc.seed}-p${index}`);
}
function isPageEdited(doc, index) {
  return doc.pages[index]?.edited ?? doc.edited;
}
function nextPageSeed(doc) {
  const used = new Set(doc.pages.map((_, i) => pageSeed(doc, i)));
  let k = 1;
  while (used.has(`${doc.seed}-p${k}`)) k++;
  return `${doc.seed}-p${k}`;
}
function materializePages(doc) {
  if (doc.pages.every((p) => p.seed !== void 0 && p.edited !== void 0)) return doc;
  return {
    ...doc,
    pages: doc.pages.map((p, i) => ({ ...p, seed: pageSeed(doc, i), edited: isPageEdited(doc, i) }))
  };
}
function settlePages(doc) {
  const m = materializePages(doc);
  if (m.pages.length === 1) {
    const { seed, edited, ...page } = m.pages[0];
    return { ...m, seed: seed ?? m.seed, edited: edited ?? m.edited, pages: [page] };
  }
  return { ...m, edited: m.pages.some((p) => p.edited) };
}

// packages/core/src/freeShapeOff.ts
var clamp3 = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
function bringBlockSettingsInside(doc) {
  const g = doc.generator;
  const count = blockCountRangeFor(gridFor(doc));
  const ranges = blockSettingRangesFor(doc.density);
  const next = {
    ...g,
    blockCount: clamp3(g.blockCount, count.min, count.max),
    cornerMeetLimit: clamp3(g.cornerMeetLimit, 0, MAX_CORNER_MEET_LIMIT),
    ...g.smallestBlock === void 0 ? {} : { smallestBlock: clamp3(g.smallestBlock, ranges.smallestBlockArea.min, ranges.smallestBlockArea.max) },
    ...g.blockProportion === void 0 ? {} : { blockProportion: clamp3(g.blockProportion, ranges.blockProportion.min, ranges.blockProportion.max) }
  };
  const moved = Object.keys(next).some((key) => next[key] !== g[key]);
  return moved ? { ...doc, generator: next } : doc;
}
function withoutFreeShape(doc) {
  if (!doc.generator.freeShape) return doc;
  const { freeShape: _freeShape, ...generator } = doc.generator;
  const kept = materializePages(bringBlockSettingsInside({ ...doc, generator }));
  return settlePages({ ...kept, pages: kept.pages.map((p) => ({ ...p, edited: true })) });
}

// packages/core/src/layouts.ts
var r = (x, y, w, h) => ({ x, y, w, h });
var LOGO_WIDTH_OF_SHORT_SIDE = 0.2;
var LOGO_ASPECT = 126 / 840;
var LOGO_MARGIN_OF_SHORT_SIDE = 0.05;
var LOGO_MIN_HEIGHT_PX = 10;
var HEADLINE_UPRIGHT = {
  zone: { rect: r(0, 0, 1, 0.44), mode: "clear" },
  slots: {
    headline: r(0.06, 0.06, 0.88, 0.19),
    secondary: r(0.06, 0.27, 0.88, 0.08),
    ticker: r(0, 0.37, 1, 0.06)
  },
  logo: "bottom-left"
};
var COVER_UPRIGHT = {
  zone: { rect: r(0.4, 0, 0.6, 0.45), mode: "flat" },
  slots: {
    headline: r(0.46, 0.06, 0.48, 0.25),
    secondary: r(0.46, 0.32, 0.48, 0.07),
    label: r(0.52, 0.4, 0.42, 0.04)
  },
  logo: "bottom-left"
};
var PRODUCT_UPRIGHT = {
  zone: { rect: r(0, 0.64, 0.7, 0.36), mode: "clear" },
  slots: {
    label: r(0.06, 0.7, 0.62, 0.05),
    photo: r(0.4, 0.1, 0.54, 0.52),
    headline: r(0.06, 0.76, 0.62, 0.19)
  },
  logo: "bottom-right"
};
var SECTION_UPRIGHT = {
  zone: { rect: r(0, 0, 0.6, 1), mode: "clear" },
  slots: {
    label: r(0.06, 0.06, 0.4, 0.05),
    headline: r(0.06, 0.16, 0.5, 0.62)
  },
  logo: "bottom-left"
};
var CONTENT_UPRIGHT = {
  zone: { rect: r(0, 0, 1, 0.8), mode: "clear" },
  slots: {
    label: r(0.06, 0.05, 0.5, 0.04),
    headline: r(0.06, 0.11, 0.88, 0.15),
    secondary: r(0.06, 0.29, 0.88, 0.45)
  },
  logo: "bottom-left"
};
var CLOSING_UPRIGHT = {
  zone: { rect: r(0, 0, 1, 0.5), mode: "clear" },
  slots: {
    headline: r(0.06, 0.08, 0.88, 0.26),
    secondary: r(0.06, 0.36, 0.88, 0.06),
    ticker: r(0, 0.43, 1, 0.07)
  },
  logo: "bottom-left"
};
var ARTICLE_COVER = {
  zone: { rect: r(1 / 32, 3 / 16, 15 / 32, 12 / 16), mode: "clear" },
  slots: {
    headline: r(1 / 32, 4 / 16, 15 / 32, 6 / 16),
    secondary: r(1 / 32, 10 / 16, 15 / 32, 3 / 16),
    // The photo fills the right half, every row (cols [16,32)). It starts where the Text zone ends, so text never meets it.
    photo: r(16 / 32, 0, 16 / 32, 1)
  },
  logo: "top-left",
  photoBackdrop: true
};
var ARTICLE_COVER_FULL = {
  ...ARTICLE_COVER,
  slots: { ...ARTICLE_COVER.slots, photo: r(0, 0, 1, 1) }
};
var ARTICLE_COVER_LOW = {
  zone: { rect: r(1 / 32, 9 / 16, 30 / 32, 6 / 16), mode: "clear" },
  slots: {
    headline: r(1 / 32, 10 / 16, 30 / 32, 3 / 16),
    secondary: r(1 / 32, 13 / 16, 30 / 32, 1 / 16),
    photo: r(0, 0, 1, 9 / 16)
  },
  logo: "top-left",
  photoBackdrop: true
};
var ARTICLE_COVER_DIRECTIONS = {
  // The line where the photo is fully the background, as a fraction of the Page along the fade's axis: Left and Full
  // fade rightward from col 16, Bottom fades upward from the photo's bottom edge, row 9.
  left: { spec: ARTICLE_COVER, edge: { axis: "x", start: 16 / 32 } },
  full: { spec: ARTICLE_COVER_FULL, edge: { axis: "x", start: 16 / 32 } },
  bottom: { spec: ARTICLE_COVER_LOW, edge: { axis: "y", start: 9 / 16 } }
};
var LAYOUT_TABLE = {
  // 6.3 #01/#02: headline top-left, clear above, optional Ticker closing the zone, the Pattern rises below.
  headline: {
    portrait: HEADLINE_UPRIGHT,
    square: HEADLINE_UPRIGHT,
    landscape: {
      zone: { rect: r(0, 0, 1, 0.46), mode: "clear" },
      slots: {
        headline: r(0.05, 0.07, 0.7, 0.21),
        secondary: r(0.05, 0.3, 0.7, 0.07),
        ticker: r(0, 0.39, 1, 0.07)
      },
      logo: "bottom-left"
    }
  },
  // 6.3 #04, 11.14: headline on a flat Block area top-right, a small mono label bottom-right. Deliberate deviation
  // from 11.14 ("date bottom-right of the Page"): the label sits bottom-right of the flat zone, under the secondary
  // copy and right-aligned to the headline column, so no Block edge can cross it.
  cover: {
    portrait: COVER_UPRIGHT,
    square: COVER_UPRIGHT,
    landscape: {
      zone: { rect: r(0.38, 0, 0.62, 0.46), mode: "flat" },
      slots: {
        headline: r(0.43, 0.06, 0.51, 0.22),
        secondary: r(0.43, 0.3, 0.51, 0.08),
        label: r(0.62, 0.395, 0.32, 0.055)
      },
      logo: "bottom-left"
    }
  },
  // 6.3 #03, 7.3: the name large bottom-left with its mono code label just above it, a photo upper right.
  "product-cover": {
    portrait: PRODUCT_UPRIGHT,
    square: PRODUCT_UPRIGHT,
    landscape: {
      zone: { rect: r(0, 0.4, 0.55, 0.6), mode: "clear" },
      slots: {
        label: r(0.05, 0.46, 0.46, 0.06),
        photo: r(0.58, 0.06, 0.36, 0.68),
        headline: r(0.05, 0.53, 0.46, 0.38)
      },
      logo: "bottom-right"
    }
  },
  // Deck: a large headline and an optional mono section number; clear on the left, the Pattern fills the rest.
  "section-divider": {
    portrait: SECTION_UPRIGHT,
    square: SECTION_UPRIGHT,
    landscape: {
      zone: { rect: r(0, 0, 0.55, 1), mode: "clear" },
      slots: {
        label: r(0.05, 0.08, 0.4, 0.06),
        headline: r(0.05, 0.18, 0.45, 0.6)
      },
      logo: "bottom-left"
    }
  },
  // Deck: headline, multi-paragraph secondary copy and an optional label. The Pattern is a small accent along
  // one edge (the bottom, or the right on a landscape Page).
  content: {
    portrait: CONTENT_UPRIGHT,
    square: CONTENT_UPRIGHT,
    landscape: {
      zone: { rect: r(0, 0, 0.82, 1), mode: "clear" },
      slots: {
        label: r(0.05, 0.07, 0.5, 0.05),
        headline: r(0.05, 0.14, 0.72, 0.2),
        secondary: r(0.05, 0.38, 0.72, 0.45)
      },
      logo: "bottom-left"
    }
  },
  // Deck: a large headline with the Ticker (the URL) closing the clear zone at the top.
  closing: {
    portrait: CLOSING_UPRIGHT,
    square: CLOSING_UPRIGHT,
    landscape: {
      zone: { rect: r(0, 0, 1, 0.55), mode: "clear" },
      slots: {
        headline: r(0.05, 0.08, 0.8, 0.3),
        secondary: r(0.05, 0.4, 0.8, 0.06),
        ticker: r(0, 0.47, 1, 0.08)
      },
      logo: "bottom-left"
    }
  },
  "article-cover": { portrait: ARTICLE_COVER, square: ARTICLE_COVER, landscape: ARTICLE_COVER }
};
function orientationFor(widthPx, heightPx) {
  if (Math.max(widthPx, heightPx) * 10 <= Math.min(widthPx, heightPx) * 11) return "square";
  return widthPx > heightPx ? "landscape" : "portrait";
}
var clamp4 = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
function snapSpan(f0, f1, n, lo, hi) {
  const a = clamp4(Math.round(f0 * n), lo, hi - 1);
  const b = clamp4(Math.round(f1 * n), a + 1, hi);
  return [a, b];
}
function snapRect(f, grid, within2) {
  const c0 = within2?.col ?? 0;
  const r0 = within2?.row ?? 0;
  const [a, b] = snapSpan(f.x, f.x + f.w, grid.cols, c0, within2 ? c0 + within2.w : grid.cols);
  const [c, d] = snapSpan(f.y, f.y + f.h, grid.rows, r0, within2 ? r0 + within2.h : grid.rows);
  return { col: a, row: c, w: b - a, h: d - c };
}
function cutAround2(a, fixed) {
  const pieces = [];
  if (fixed.col > a.col) pieces.push({ ...a, w: fixed.col - a.col });
  const fr = fixed.col + fixed.w;
  if (fr < a.col + a.w) pieces.push({ ...a, col: fr, w: a.col + a.w - fr });
  if (fixed.row > a.row) pieces.push({ ...a, h: fixed.row - a.row });
  const fb = fixed.row + fixed.h;
  if (fb < a.row + a.h) pieces.push({ ...a, row: fb, h: a.row + a.h - fb });
  return pieces.sort((p, q) => q.w * q.h - p.w * p.h)[0] ?? null;
}
var toPx = (c, grid) => ({
  x: c.col * grid.cellW,
  y: c.row * grid.cellH,
  w: c.w * grid.cellW,
  h: c.h * grid.cellH
});
function logoBox(widthPx, heightPx, anchor) {
  const short = Math.min(widthPx, heightPx);
  const h = Math.max(LOGO_MIN_HEIGHT_PX, short * LOGO_WIDTH_OF_SHORT_SIDE * LOGO_ASPECT);
  const w = h / LOGO_ASPECT;
  const margin = Math.max(h, short * LOGO_MARGIN_OF_SHORT_SIDE);
  const x = anchor.endsWith("left") ? margin : widthPx - margin - w;
  const y = anchor.startsWith("top") ? margin : heightPx - margin - h;
  return { x: Math.max(0, x), y: Math.max(0, y), w, h };
}
function cellsCovering(box, grid) {
  const c0 = clamp4(Math.floor(box.x / grid.cellW + EPS), 0, grid.cols - 1);
  const r0 = clamp4(Math.floor(box.y / grid.cellH + EPS), 0, grid.rows - 1);
  const c1 = clamp4(Math.ceil((box.x + box.w) / grid.cellW - EPS), c0 + 1, grid.cols);
  const r1 = clamp4(Math.ceil((box.y + box.h) / grid.cellH - EPS), r0 + 1, grid.rows);
  return { col: c0, row: r0, w: c1 - c0, h: r1 - r0 };
}
var PRIORITY = ["logo", "headline", "photo", "ticker", "secondary", "label"];
var EPS = 1e-9;
function layoutSlotsFor(doc, layout, fadeDirection = DEFAULT_FADE_DIRECTION) {
  const { widthPx, heightPx } = getFormatDimensions(doc);
  const orientation = orientationFor(widthPx, heightPx);
  if (layout === "pattern") return { layout, orientation, slots: {} };
  const grid = gridFor(doc);
  const spec = layout === "article-cover" ? ARTICLE_COVER_DIRECTIONS[fadeDirection].spec : LAYOUT_TABLE[layout][orientation];
  const zoneCells = snapRect(spec.zone.rect, grid);
  const textZone = { ...zoneCells, mode: spec.zone.mode };
  const ring = spec.zone.mode === "clear" ? CLEAR_ZONE_RING_DEPTH : 0;
  const inner = zoneCells.w > 2 * ring && zoneCells.h > 2 * ring ? { col: zoneCells.col + ring, row: zoneCells.row + ring, w: zoneCells.w - 2 * ring, h: zoneCells.h - 2 * ring } : zoneCells;
  const candidates = /* @__PURE__ */ new Map();
  const inZone = (f) => f.x >= spec.zone.rect.x - EPS && f.y >= spec.zone.rect.y - EPS && f.x + f.w <= spec.zone.rect.x + spec.zone.rect.w + EPS && f.y + f.h <= spec.zone.rect.y + spec.zone.rect.h + EPS;
  for (const [name, f] of Object.entries(spec.slots)) {
    candidates.set(name, snapRect(f, grid, inZone(f) ? name === "ticker" ? zoneCells : inner : void 0));
  }
  const box = logoBox(widthPx, heightPx, spec.logo);
  candidates.set("logo", cellsCovering(box, grid));
  const placed = [];
  const collide = [];
  for (const name of PRIORITY) {
    let cells = candidates.get(name) ?? null;
    if (!cells) continue;
    const backdrop = name === "photo" && spec.photoBackdrop === true;
    if (!backdrop) {
      for (const other of collide) {
        if (cells && overlaps(cells, other)) cells = cutAround2(cells, other);
      }
    }
    if (!cells) continue;
    placed.push([name, cells]);
    if (!backdrop) collide.push(cells);
  }
  const slots = {};
  for (const [name, cells] of placed) {
    if (name === "logo") slots.logo = { cells, px: toPx(cells, grid), anchor: spec.logo, box };
    else slots[name] = { cells, px: toPx(cells, grid) };
  }
  return { layout, orientation, slots, textZone, ...spec.photoBackdrop && slots.photo ? { photoBackdrop: true } : {} };
}
function layoutTextZone(doc, layout, fadeDirection = DEFAULT_FADE_DIRECTION) {
  return layoutSlotsFor(doc, layout, fadeDirection).textZone;
}
var fadeDirectionOf = (page) => page?.layout === "article-cover" ? page.articleCover?.fadeDirection ?? DEFAULT_FADE_DIRECTION : DEFAULT_FADE_DIRECTION;
function layoutSlots(doc, pageIndex = 0) {
  const page = doc.pages[pageIndex];
  return layoutSlotsFor(doc, page?.layout ?? "pattern", fadeDirectionOf(page));
}
function articleCoverPatternArea(doc, fadeDirection) {
  const grid = gridFor(doc);
  const zone = layoutSlotsFor(doc, "article-cover", fadeDirection).textZone;
  if (ARTICLE_COVER_DIRECTIONS[fadeDirection].edge.axis === "x") {
    const col = zone.col + zone.w - CLEAR_ZONE_RING_DEPTH;
    return { col, row: 0, w: grid.cols - col, h: grid.rows };
  }
  return { col: 0, row: 0, w: grid.cols, h: zone.row + CLEAR_ZONE_RING_DEPTH };
}
function articleCoverEdge(doc, fadeDirection) {
  const { axis, start: frac } = ARTICLE_COVER_DIRECTIONS[fadeDirection].edge;
  const grid = gridFor(doc);
  const photo = layoutSlotsFor(doc, "article-cover", fadeDirection).slots.photo.cells;
  if (axis === "x") {
    const start2 = clamp4(Math.round(frac * grid.cols), photo.col, photo.col + photo.w);
    return { axis, start: start2, room: photo.col + photo.w - start2 };
  }
  const start = clamp4(Math.round(frac * grid.rows), photo.row, photo.row + photo.h);
  return { axis, start, room: start - photo.row };
}
function fadeLengthMax(doc, fadeDirection) {
  return Math.min(FADE_LENGTH_RANGE.max, articleCoverEdge(doc, fadeDirection).room);
}

// packages/core/src/prng.ts
function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed) {
  let s = seed | 0;
  return function next() {
    s = s + 1831565813 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function createRng(seed) {
  return mulberry32(hashString(seed));
}
function generateRandomSeed() {
  return Math.random().toString(36).substring(2, 10);
}

// packages/core/src/handEdited.ts
var signature = (blocks) => blocks.map((b) => `${b.col},${b.row},${b.w},${b.h},${b.tint}`).sort().join("|");
function drawOrigin(doc, pageIndex) {
  const page = doc.pages[pageIndex];
  const seed = pageSeed(doc, pageIndex);
  const grid = gridFor(doc);
  const colourway = getColourway(doc.colourway);
  const redraw = (params) => {
    const diagnostics = {};
    const { blocks } = generatePatternDetailed(grid, colourway, createRng(seed), params, {
      density: doc.density,
      ...page.textZone ? { textZone: page.textZone } : {},
      diagnostics
    });
    return { blocks, path: diagnostics.path, ...diagnostics.copiedSource === "keeper" ? { keeperCopy: true } : {} };
  };
  const first = redraw(doc.generator);
  if (!isPageEdited(doc, pageIndex)) return { handEdited: false, path: first.path, ...first.keeperCopy ? { keeperCopy: true } : {} };
  const target = signature(page.pattern);
  if (signature(first.blocks) === target) return { handEdited: false, path: first.path, ...first.keeperCopy ? { keeperCopy: true } : {} };
  const chosen = doc.generator.family ?? "auto";
  const families = chosen === "auto" ? ["rising", "hanging", "mountain"] : [chosen];
  const seedGuidance = /g(\d+)r\d+$/.exec(seed)?.[1];
  const guidances = [doc.generator.guidance, ...seedGuidance ? [Number(seedGuidance)] : []];
  for (const guidance of guidances) {
    for (const family of families) {
      const again = redraw({ ...doc.generator, family, guidance, referenceSet: rollReferenceSet(doc.generator.referenceSet) });
      if (signature(again.blocks) === target) return { handEdited: false, path: again.path, ...again.keeperCopy ? { keeperCopy: true } : {} };
    }
  }
  return { handEdited: true };
}
function isHandEdited(doc, pageIndex) {
  return drawOrigin(doc, pageIndex).handEdited;
}
function shapeSettingsMoveNothing(doc) {
  if (!isTemplateModeCertain(doc.generator.guidance)) return false;
  return doc.pages.every((_, i) => {
    const origin = drawOrigin(doc, i);
    return origin.handEdited || origin.path !== "formula";
  });
}

// packages/core/src/patternRemap.ts
function scaleSide(raw, max) {
  return Math.max(1, Math.min(max, Math.round(raw)));
}
function remapBlock(block, from, to) {
  const colRatio = to.w / from.w;
  const rowRatio = to.h / from.h;
  const w = scaleSide(block.w * colRatio, to.w);
  const h = scaleSide(block.h * rowRatio, to.h);
  const col = Math.max(to.col, Math.min(to.col + to.w - w, to.col + Math.round((block.col - from.col + block.w / 2) * colRatio - w / 2)));
  const row = Math.max(to.row, Math.min(to.row + to.h - h, to.row + Math.round((block.row - from.row + block.h / 2) * rowRatio - h / 2)));
  return { ...block, col, row, w, h };
}
function reconnectEdges(old, next, bounds) {
  const ranges = (a0, a1, b0, b1) => a0 < b1 && b0 < a1;
  for (const axis of ["x", "y", "x", "y"]) {
    const order = old.map((_, i) => i).sort((i, j) => axis === "x" ? old[i].col - old[j].col : old[i].row - old[j].row);
    for (const i of order) {
      for (const j of order) {
        const a = old[i];
        const b = old[j];
        const touching = axis === "x" ? a.col + a.w === b.col && ranges(a.row, a.row + a.h, b.row, b.row + b.h) : a.row + a.h === b.row && ranges(a.col, a.col + a.w, b.col, b.col + b.w);
        if (!touching) continue;
        const na = next[i];
        const nb = next[j];
        const moved = axis === "x" ? { ...nb, col: na.col + na.w } : { ...nb, row: na.row + na.h };
        if (moved.col === nb.col && moved.row === nb.row) continue;
        if (moved.col + moved.w > bounds.col + bounds.w || moved.row + moved.h > bounds.row + bounds.h) continue;
        const stillShares = axis === "x" ? ranges(na.row, na.row + na.h, moved.row, moved.row + moved.h) : ranges(na.col, na.col + na.w, moved.col, moved.col + moved.w);
        if (!stillShares) continue;
        if (next.some((o, k) => k !== j && overlaps(moved, o))) continue;
        next[j] = moved;
      }
    }
  }
}
var contains = (outer, inner) => outer.col <= inner.col && outer.row <= inner.row && outer.col + outer.w >= inner.col + inner.w && outer.row + outer.h >= inner.row + inner.h;
function resolveOverlaps(blocks) {
  const out = blocks.map((b) => ({ ...b }));
  const dropped = /* @__PURE__ */ new Set();
  for (let guard = 0; guard < out.length * 4; guard++) {
    let changed = false;
    for (let j = 0; j < out.length && !changed; j++) {
      if (dropped.has(j)) continue;
      for (let i = 0; i < out.length && !changed; i++) {
        if (i === j || dropped.has(i) || !overlaps(out[i], out[j])) continue;
        const a = out[i];
        const b = out[j];
        if (contains(a, b) && (i < j || !contains(b, a))) dropped.add(j);
        else if (i > j) continue;
        else {
          const pieces = [
            { ...b, w: a.col - b.col },
            { ...b, col: a.col + a.w, w: b.col + b.w - (a.col + a.w) },
            { ...b, h: a.row - b.row },
            { ...b, row: a.row + a.h, h: b.row + b.h - (a.row + a.h) }
          ].filter((p) => p.w >= 1 && p.h >= 1 && !overlaps(p, a));
          pieces.sort((p, q) => q.w * q.h - p.w * p.h);
          if (pieces[0]) out[j] = pieces[0];
          else dropped.add(j);
        }
        changed = true;
      }
    }
    if (!changed) break;
  }
  return out.filter((_, k) => !dropped.has(k));
}
var cellsInZone = (b, z) => Math.max(0, Math.min(b.col + b.w, z.col + z.w) - Math.max(b.col, z.col)) * Math.max(0, Math.min(b.row + b.h, z.row + z.h) - Math.max(b.row, z.row));
function clearingMoves(b, zone, bounds, others) {
  const zoneEndCol = zone.col + zone.w;
  const zoneEndRow = zone.row + zone.h;
  const cuts = [];
  if (b.row < zone.row) cuts.push({ ...b, h: zone.row - b.row });
  if (b.row + b.h > zoneEndRow) cuts.push({ ...b, row: zoneEndRow, h: b.row + b.h - zoneEndRow });
  if (b.col < zone.col) cuts.push({ ...b, w: zone.col - b.col });
  if (b.col + b.w > zoneEndCol) cuts.push({ ...b, col: zoneEndCol, w: b.col + b.w - zoneEndCol });
  const keepsSome = cuts.filter((c) => c.w >= 1 && c.h >= 1 && cellsInZone(c, zone) === 0).sort((x, y) => y.w * y.h - x.w * x.h);
  const shifts = [
    { ...b, row: zone.row - b.h },
    { ...b, row: zoneEndRow },
    { ...b, col: zone.col - b.w },
    { ...b, col: zoneEndCol }
  ].filter((s) => s.col >= bounds.col && s.row >= bounds.row && s.col + s.w <= bounds.col + bounds.w && s.row + s.h <= bounds.row + bounds.h).filter((s) => cellsInZone(s, zone) === 0 && !others.some((o) => overlaps(s, o))).sort((x, y) => Math.abs(x.col - b.col) + Math.abs(x.row - b.row) - (Math.abs(y.col - b.col) + Math.abs(y.row - b.row)));
  return [...keepsSome, ...shifts];
}
function trimClearZone2(blocks, zone, bounds) {
  const skipped = /* @__PURE__ */ new Set();
  for (let guard = 0; guard < blocks.length * 2 + 4; guard++) {
    const overlap = measureClearZoneOverlap({ pattern: blocks, textZone: zone });
    if (overlap.withinLimit) return true;
    const allowed = Math.floor(zone.w * zone.h * CLEAR_ZONE_MAX_OVERLAP);
    const need = Math.max(1, overlap.covered - allowed);
    const reaching = blocks.map((b, i) => ({ i, n: cellsInZone(b, zone) })).filter((x) => x.n > 0 && !skipped.has(x.i)).sort((x, y) => x.n - y.n);
    if (reaching.length === 0) return false;
    const pick = reaching.find((x) => x.n >= need) ?? reaching[reaching.length - 1];
    const others = blocks.filter((_, k) => k !== pick.i);
    const move = clearingMoves(blocks[pick.i], zone, bounds, others)[0];
    if (move) blocks[pick.i] = move;
    else skipped.add(pick.i);
  }
  return measureClearZoneOverlap({ pattern: blocks, textZone: zone }).withinLimit;
}
function remapPattern(blocks, spec) {
  const { from, to, fromGrid, toGrid, zone } = spec;
  let pattern = blocks.map((b) => remapBlock(b, from, to));
  reconnectEdges(blocks, pattern, to);
  if (spec.resolveOverlaps) pattern = resolveOverlaps(pattern);
  const followedRules = checkPatternRules(blocks, fromGrid).ok;
  const repair = () => {
    if (!followedRules || checkPatternRules(pattern, toGrid).ok) return;
    const repaired = repairPatternRules(pattern, toGrid, /* @__PURE__ */ new Set(), to);
    if (repaired && checkPatternRules(repaired, toGrid).ok) pattern = repaired;
  };
  repair();
  if (zone && zone.mode === "clear") {
    for (let round2 = 0; round2 < 3; round2++) {
      if (!trimClearZone2(pattern, zone, to)) break;
      if (!followedRules || checkPatternRules(pattern, toGrid).ok) break;
      repair();
    }
  }
  return pattern;
}

// packages/core/src/serialization.ts
var CURRENT_SCHEMA_VERSION = 4;
var CURRENT_APP_NAME = "fnm-pattern-builder";
var ALLOWED_FILE_KEYS = /* @__PURE__ */ new Set(["app", "schema", "document"]);
var ALLOWED_DOC_KEYS = /* @__PURE__ */ new Set([
  "version",
  "format",
  "density",
  "colourway",
  "seed",
  "generator",
  "blockCountExplicit",
  "pages",
  "customSize",
  "edited",
  "transparentBackground"
]);
var ALLOWED_PAGE_KEYS = /* @__PURE__ */ new Set(["pattern", "textZone", "layout", "content", "seed", "edited", "articleCover"]);
var PAGE_LAYOUTS = ["pattern", "headline", "cover", "product-cover", "section-divider", "content", "closing", "article-cover"];
var ALLOWED_GENERATOR_KEYS = /* @__PURE__ */ new Set(["slope", "blockCount", "cornerMeetLimit", "guidance", "family", "referenceSet", ...FORMULA_SETTING_KEYS, "freeShape"]);
var ALLOWED_TEXT_ZONE_KEYS = /* @__PURE__ */ new Set(["col", "row", "w", "h", "mode"]);
var ALLOWED_BLOCK_KEYS = /* @__PURE__ */ new Set(["id", "col", "row", "w", "h", "tint"]);
var ALLOWED_CUSTOM_SIZE_KEYS = /* @__PURE__ */ new Set(["widthPx", "heightPx"]);
function validateTextZone(raw, grid, pIdx) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return `Text zone on page ${pIdx} must be an object`;
  }
  const z = raw;
  for (const key of Object.keys(z)) {
    if (!ALLOWED_TEXT_ZONE_KEYS.has(key)) {
      return `Unexpected property in text zone on page ${pIdx}: '${key}'`;
    }
  }
  if (z.mode !== "clear" && z.mode !== "flat") {
    return `Text zone mode on page ${pIdx} must be 'clear' or 'flat'`;
  }
  const { col, row, w, h } = z;
  if (typeof col !== "number" || typeof row !== "number" || typeof w !== "number" || typeof h !== "number" || ![col, row, w, h].every(Number.isInteger) || w < 1 || h < 1 || col < 0 || row < 0 || col + w > grid.cols || row + h > grid.rows) {
    return `Text zone on page ${pIdx} must be whole cells, at least 1x1, inside the ${grid.cols}x${grid.rows} Grid`;
  }
  return { col, row, w, h, mode: z.mode };
}
function validateDocument(rawDoc) {
  if (!rawDoc || typeof rawDoc !== "object" || Array.isArray(rawDoc)) {
    return {
      error: {
        code: "file.invalid",
        message: "Document must be a valid JSON object"
      }
    };
  }
  const doc = rawDoc;
  for (const key of Object.keys(doc)) {
    if (!ALLOWED_DOC_KEYS.has(key)) {
      return {
        error: {
          code: "file.invalid",
          message: `Unexpected property in document: '${key}'`
        }
      };
    }
  }
  if (typeof doc.version !== "number" || !Number.isInteger(doc.version)) {
    return {
      error: {
        code: "file.invalid",
        message: "Document version must be an integer"
      }
    };
  }
  if (doc.version > 1) {
    return {
      error: {
        code: "file.unsupportedVersion",
        message: `Document version ${doc.version} is newer than supported version 1`
      }
    };
  }
  if (doc.version < 1) {
    return {
      error: {
        code: "file.invalid",
        message: `Invalid document version: ${doc.version}`
      }
    };
  }
  if (typeof doc.format !== "string") {
    return {
      error: {
        code: "file.invalid",
        message: "Document format must be a string"
      }
    };
  }
  const formatDef = FORMATS.find((f) => f.id === doc.format);
  if (!formatDef) {
    return {
      error: {
        code: "file.invalid",
        message: `Unknown format: '${doc.format}'`
      }
    };
  }
  let customSize;
  if (doc.format === "custom") {
    if (!doc.customSize || typeof doc.customSize !== "object" || Array.isArray(doc.customSize)) {
      return {
        error: {
          code: "file.invalid",
          message: "Custom format requires a customSize object"
        }
      };
    }
    const cs = doc.customSize;
    for (const key of Object.keys(cs)) {
      if (!ALLOWED_CUSTOM_SIZE_KEYS.has(key)) {
        return {
          error: {
            code: "file.invalid",
            message: `Unexpected property in customSize: '${key}'`
          }
        };
      }
    }
    const { widthPx, heightPx } = cs;
    if (typeof widthPx !== "number" || typeof heightPx !== "number" || !Number.isInteger(widthPx) || !Number.isInteger(heightPx) || widthPx < 64 || widthPx > 8e3 || heightPx < 64 || heightPx > 8e3) {
      return {
        error: {
          code: "file.invalid",
          message: "Custom format requires widthPx and heightPx integers between 64 and 8000"
        }
      };
    }
    customSize = { widthPx, heightPx };
  } else if (doc.customSize !== void 0) {
    return {
      error: {
        code: "file.invalid",
        message: "customSize is only allowed for custom format"
      }
    };
  }
  if (typeof doc.density !== "string") {
    return {
      error: {
        code: "file.invalid",
        message: "Document density must be a string"
      }
    };
  }
  const supportedLevels = densityLevelsFor(doc.format, customSize);
  if (!supportedLevels.some((l) => l.level === doc.density)) {
    return {
      error: {
        code: "file.invalid",
        message: `Density level '${doc.density}' is not supported for format '${doc.format}'`
      }
    };
  }
  if (typeof doc.colourway !== "string") {
    return {
      error: {
        code: "file.invalid",
        message: "Colourway must be a string ID"
      }
    };
  }
  const colourwayId = migrateColourwayId(doc.colourway);
  const migratedColourway = colourwayId !== doc.colourway;
  const colourway = getColourway(colourwayId);
  if (!colourway) {
    return {
      error: {
        code: "file.invalid",
        message: `Unknown colourway ID: '${doc.colourway}'`
      }
    };
  }
  if (typeof doc.seed !== "string") {
    return {
      error: {
        code: "file.invalid",
        message: "Seed must be a string"
      }
    };
  }
  if (typeof doc.edited !== "boolean") {
    return {
      error: {
        code: "file.invalid",
        message: "Edited must be a boolean"
      }
    };
  }
  const gen = doc.generator;
  if (!gen || typeof gen !== "object" || Array.isArray(gen)) {
    return {
      error: { code: "file.invalid", message: "Generator must be an object" }
    };
  }
  const genRec = gen;
  for (const key of Object.keys(genRec)) {
    if (!ALLOWED_GENERATOR_KEYS.has(key)) {
      return {
        error: { code: "file.invalid", message: `Unexpected property in generator: '${key}'` }
      };
    }
  }
  if (typeof genRec.slope !== "string" || typeof genRec.blockCount !== "number" || typeof genRec.cornerMeetLimit !== "number") {
    return {
      error: {
        code: "file.invalid",
        message: "Generator requires slope (string), blockCount and cornerMeetLimit (numbers)"
      }
    };
  }
  const genProblem = validateGeneratorParams(genRec);
  if (genProblem) {
    return { error: { code: "file.invalid", message: `Invalid generator: ${genProblem}` } };
  }
  const generator = {
    slope: genRec.slope,
    blockCount: genRec.blockCount,
    cornerMeetLimit: genRec.cornerMeetLimit,
    // Files saved before Guidance existed keep their Patterns: guidance 0.
    guidance: genRec.guidance === void 0 ? 0 : genRec.guidance,
    // Files saved before the family choice (or with 'auto') let the seed choose.
    ...genRec.family !== void 0 && genRec.family !== "auto" ? { family: genRec.family } : {},
    // Files saved before Reference sets drew from set 1, as a missing set does.
    ...genRec.referenceSet !== void 0 ? { referenceSet: genRec.referenceSet } : {},
    // Shape settings and the rest are written only when set (#96); a file without them is as it was.
    ...formulaSettingsOf(genRec),
    // Free shape (ADR 0012): written only while set; validateGeneratorParams has checked it.
    ...genRec.freeShape !== void 0 ? { freeShape: cleanFreeShape(genRec.freeShape) } : {}
  };
  const validatedDocForGrid = {
    version: 1,
    format: doc.format,
    density: doc.density,
    colourway: colourwayId,
    seed: doc.seed,
    generator,
    pages: [],
    ...customSize ? { customSize } : {},
    edited: doc.edited
  };
  const grid = gridFor(validatedDocForGrid);
  const formulaProblem = validateFormulaParams(generator, doc.density, grid);
  if (formulaProblem) {
    return { error: { code: "file.invalid", message: `Invalid generator: ${formulaProblem}` } };
  }
  if (doc.blockCountExplicit !== void 0 && typeof doc.blockCountExplicit !== "boolean") {
    return {
      error: { code: "file.invalid", message: "blockCountExplicit must be a boolean" }
    };
  }
  const blockCountExplicit = doc.blockCountExplicit;
  if (doc.transparentBackground !== void 0 && typeof doc.transparentBackground !== "boolean") {
    return {
      error: { code: "file.invalid", message: "transparentBackground must be a boolean" }
    };
  }
  if (!Array.isArray(doc.pages) || doc.pages.length === 0) {
    return {
      error: {
        code: "file.invalid",
        message: "Pages must be a non-empty array"
      }
    };
  }
  const freeShapeProblem = generator.freeShape ? validateFreeShape(generator.freeShape, grid.cols) : null;
  if (freeShapeProblem) return { error: { code: "file.invalid", message: `Invalid generator: ${freeShapeProblem}` } };
  const validatedPages = [];
  for (let pIdx = 0; pIdx < doc.pages.length; pIdx++) {
    const blockIds = /* @__PURE__ */ new Set();
    const rawPage = doc.pages[pIdx];
    if (!rawPage || typeof rawPage !== "object" || Array.isArray(rawPage)) {
      return {
        error: {
          code: "file.invalid",
          message: `Page at index ${pIdx} must be an object`
        }
      };
    }
    const page = rawPage;
    for (const key of Object.keys(page)) {
      if (!ALLOWED_PAGE_KEYS.has(key)) {
        return {
          error: {
            code: "file.invalid",
            message: `Unexpected property in page at index ${pIdx}: '${key}'`
          }
        };
      }
    }
    if (!Array.isArray(page.pattern)) {
      return {
        error: {
          code: "file.invalid",
          message: `Page pattern at index ${pIdx} must be an array`
        }
      };
    }
    let textZone;
    if (page.textZone !== void 0) {
      const zr = validateTextZone(page.textZone, grid, pIdx);
      if (typeof zr === "string") return { error: { code: "file.invalid", message: zr } };
      textZone = zr;
    }
    let layout;
    if (page.layout !== void 0) {
      if (!PAGE_LAYOUTS.includes(page.layout)) {
        return { error: { code: "file.invalid", message: `Unknown layout on page ${pIdx}: '${String(page.layout)}'` } };
      }
      if (page.layout !== "pattern") layout = page.layout;
    }
    if (page.seed !== void 0 && (typeof page.seed !== "string" || page.seed === "")) {
      return { error: { code: "file.invalid", message: `Seed on page ${pIdx} must be a non-empty string` } };
    }
    if (page.edited !== void 0 && typeof page.edited !== "boolean") {
      return { error: { code: "file.invalid", message: `Edited on page ${pIdx} must be a boolean` } };
    }
    let articleCover;
    if (page.articleCover !== void 0) {
      if (layout !== "article-cover") {
        return { error: { code: "file.invalid", message: `Page ${pIdx} has Article cover settings but is not an Article cover` } };
      }
      const problem = articleCoverProblem(page.articleCover);
      if (problem) return { error: { code: "file.invalid", message: `Article cover settings on page ${pIdx}: ${problem.message}` } };
      articleCover = { ...page.articleCover };
    }
    let content;
    if (page.content !== void 0) {
      const problem = contentProblem(page.content);
      if (problem) return { error: { code: "file.invalid", message: `Content on page ${pIdx}: ${problem.message}` } };
      content = cleanContent(page.content);
    }
    const validatedBlocks = [];
    for (let bIdx = 0; bIdx < page.pattern.length; bIdx++) {
      const rawBlock = page.pattern[bIdx];
      if (!rawBlock || typeof rawBlock !== "object" || Array.isArray(rawBlock)) {
        return {
          error: {
            code: "file.invalid",
            message: `Block at index ${bIdx} on page ${pIdx} must be an object`
          }
        };
      }
      const block = rawBlock;
      for (const key of Object.keys(block)) {
        if (!ALLOWED_BLOCK_KEYS.has(key)) {
          return {
            error: {
              code: "file.invalid",
              message: `Unexpected property in block at index ${bIdx}: '${key}'`
            }
          };
        }
      }
      if (typeof block.id !== "string" || block.id.trim() === "") {
        return {
          error: {
            code: "file.invalid",
            message: `Block at index ${bIdx} must have a non-empty string id`
          }
        };
      }
      if (blockIds.has(block.id)) {
        return {
          error: {
            code: "file.invalid",
            message: `Duplicate block id '${block.id}'`
          }
        };
      }
      blockIds.add(block.id);
      if (typeof block.col !== "number" || !Number.isInteger(block.col) || block.col < 0) {
        return {
          error: {
            code: "file.invalid",
            message: `Block '${block.id}' col must be a non-negative integer`
          }
        };
      }
      if (typeof block.row !== "number" || !Number.isInteger(block.row) || block.row < 0) {
        return {
          error: {
            code: "file.invalid",
            message: `Block '${block.id}' row must be a non-negative integer`
          }
        };
      }
      if (typeof block.w !== "number" || typeof block.h !== "number" || !isValidBlockSize(block.w, grid.cols) || !isValidBlockSize(block.h, grid.rows)) {
        return {
          error: {
            code: "file.invalid",
            message: `Block '${block.id}' size ${block.w}x${block.h} is not a whole number of cells within a ${grid.cols}x${grid.rows} Grid`
          }
        };
      }
      if (block.col + block.w > grid.cols || block.row + block.h > grid.rows) {
        return {
          error: {
            code: "file.invalid",
            message: `Block '${block.id}' (${block.col},${block.row},${block.w},${block.h}) exceeds grid bounds (${grid.cols}x${grid.rows})`
          }
        };
      }
      const tint = migratedColourway && Number.isInteger(block.tint) ? 0 : block.tint;
      if (typeof tint !== "number" || !Number.isInteger(tint) || tint < 0 || tint >= colourway.tints.length) {
        return {
          error: {
            code: "file.invalid",
            message: `Block '${block.id}' tint index ${tint} is out of range for colourway '${doc.colourway}' (0..${colourway.tints.length - 1})`
          }
        };
      }
      validatedBlocks.push({
        id: block.id,
        col: block.col,
        row: block.row,
        w: block.w,
        h: block.h,
        tint
      });
    }
    validatedPages.push({
      pattern: validatedBlocks,
      ...textZone ? { textZone } : {},
      ...layout ? { layout } : {},
      ...content ? { content } : {},
      ...articleCover ? { articleCover } : {},
      ...page.seed !== void 0 ? { seed: page.seed } : {},
      ...page.edited !== void 0 ? { edited: page.edited } : {}
    });
  }
  const cleanDoc = {
    version: 1,
    format: doc.format,
    density: doc.density,
    colourway: colourwayId,
    seed: doc.seed,
    generator,
    ...blockCountExplicit !== void 0 ? { blockCountExplicit } : {},
    pages: validatedPages,
    ...customSize ? { customSize } : {},
    edited: doc.edited,
    ...doc.transparentBackground === true ? { transparentBackground: true } : {}
  };
  const coverProblem = articleCoverDocumentProblem(cleanDoc) ?? colourPhotoProblem(cleanDoc);
  if (coverProblem) return { error: { code: "file.invalid", message: coverProblem } };
  return { document: cleanDoc };
}
function serialize(doc) {
  const file = {
    app: CURRENT_APP_NAME,
    schema: CURRENT_SCHEMA_VERSION,
    document: {
      version: 1,
      format: doc.format,
      density: doc.density,
      colourway: doc.colourway,
      seed: doc.seed,
      generator: {
        slope: doc.generator.slope,
        blockCount: doc.generator.blockCount,
        cornerMeetLimit: doc.generator.cornerMeetLimit,
        guidance: doc.generator.guidance,
        ...doc.generator.family && doc.generator.family !== "auto" ? { family: doc.generator.family } : {},
        ...doc.generator.referenceSet !== void 0 ? { referenceSet: doc.generator.referenceSet } : {},
        ...formulaSettingsOf(doc.generator),
        ...doc.generator.freeShape ? { freeShape: cleanFreeShape(doc.generator.freeShape) } : {}
      },
      ...doc.blockCountExplicit !== void 0 ? { blockCountExplicit: doc.blockCountExplicit } : {},
      pages: doc.pages.map((p) => {
        const content = cleanContent(p.content ?? {});
        return {
          pattern: p.pattern.map((b) => ({
            id: b.id,
            col: b.col,
            row: b.row,
            w: b.w,
            h: b.h,
            tint: b.tint
          })),
          ...p.textZone ? { textZone: { col: p.textZone.col, row: p.textZone.row, w: p.textZone.w, h: p.textZone.h, mode: p.textZone.mode } } : {},
          ...p.layout && p.layout !== "pattern" ? { layout: p.layout } : {},
          ...content ? { content } : {},
          ...p.articleCover ? { articleCover: { ...p.articleCover } } : {},
          ...p.seed !== void 0 ? { seed: p.seed } : {},
          ...p.edited !== void 0 ? { edited: p.edited } : {}
        };
      }),
      ...doc.customSize ? { customSize: { widthPx: doc.customSize.widthPx, heightPx: doc.customSize.heightPx } } : {},
      edited: doc.edited,
      ...doc.transparentBackground ? { transparentBackground: true } : {}
    }
  };
  return JSON.stringify(file, null, 2);
}
function deserialize(text) {
  if (typeof text !== "string") {
    return {
      error: {
        code: "file.invalid",
        message: "File content must be a string"
      }
    };
  }
  const cleanText = text.replace(/^\uFEFF/, "").trim();
  if (!cleanText) {
    return {
      error: {
        code: "file.invalid",
        message: "File is empty"
      }
    };
  }
  let parsed2;
  try {
    parsed2 = JSON.parse(cleanText);
  } catch (err) {
    return {
      error: {
        code: "file.invalid",
        message: `Invalid JSON: ${err.message}`
      }
    };
  }
  if (!parsed2 || typeof parsed2 !== "object" || Array.isArray(parsed2)) {
    return {
      error: {
        code: "file.invalid",
        message: "File content must be a JSON object"
      }
    };
  }
  const fileObj = parsed2;
  for (const key of Object.keys(fileObj)) {
    if (!ALLOWED_FILE_KEYS.has(key)) {
      return {
        error: {
          code: "file.invalid",
          message: `Unexpected property in file: '${key}'`
        }
      };
    }
  }
  if (fileObj.app !== CURRENT_APP_NAME) {
    return {
      error: {
        code: "file.invalid",
        message: `Invalid app identifier: expected '${CURRENT_APP_NAME}', got '${String(fileObj.app)}'`
      }
    };
  }
  if (typeof fileObj.schema !== "number" || !Number.isInteger(fileObj.schema)) {
    return {
      error: {
        code: "file.invalid",
        message: "Schema version must be an integer"
      }
    };
  }
  if (fileObj.schema > CURRENT_SCHEMA_VERSION) {
    return {
      error: {
        code: "file.unsupportedVersion",
        message: `Schema version ${fileObj.schema} is newer than supported version ${CURRENT_SCHEMA_VERSION}`
      }
    };
  }
  if (fileObj.schema < 1) {
    return {
      error: {
        code: "file.invalid",
        message: `Invalid schema version: ${fileObj.schema}`
      }
    };
  }
  if (!fileObj.document) {
    return {
      error: {
        code: "file.invalid",
        message: "Missing document in file"
      }
    };
  }
  return validateDocument(fileObj.document);
}

// packages/core/src/warnings.ts
var RECOMMENDED_MAX_FACTOR = 1.75;
var MAX_HIGHLIGHT_WORDS = 4;
var MIN_CAPS_LETTERS = 4;
var MAX_RECOMMENDED_CORNER_MEETS = 3;
function recommendedMaxBlockCountFor(grid) {
  return Math.max(4, Math.ceil(RECOMMENDED_MAX_FACTOR * defaultBlockCountFor(grid)));
}
var wordSegmenter;
function countHighlightWords(headline) {
  wordSegmenter ??= new Intl.Segmenter("th", { granularity: "word" });
  let count = 0;
  for (const run of headline.matchAll(/\[([^\[\]]*)\]/g)) {
    for (const seg of wordSegmenter.segment(run[1])) if (seg.isWordLike) count++;
  }
  return count;
}
function isAllCapsHeadline(headline) {
  const letters = headline.match(new RegExp("\\p{Script=Latin}", "gu")) ?? [];
  return letters.length >= MIN_CAPS_LETTERS && letters.every((l) => l === l.toUpperCase() && l !== l.toLowerCase());
}
function computeWarnings(doc) {
  const warnings = [];
  const grid = gridFor(doc);
  const maxBlocks = recommendedMaxBlockCountFor(grid);
  const deck = doc.pages.length > 1;
  doc.pages.forEach((page, pageIndex) => {
    const pattern = page.pattern;
    const about = deck ? `Page ${pageIndex + 1}: ` : "";
    if (pattern.length > maxBlocks && !doc.generator.freeShape) {
      warnings.push({
        code: "advisory.blockCount",
        message: `${about}Block count (${pattern.length}) exceeds the recommended maximum of ${maxBlocks} for a ${grid.cols}\xD7${grid.rows} Grid.`,
        pageIndex,
        count: pattern.length,
        max: maxBlocks
      });
    }
    const meets = countCornerMeets(pattern);
    if (meets.length > MAX_RECOMMENDED_CORNER_MEETS) {
      warnings.push({
        code: "advisory.cornerMeets",
        message: `${about}Corner meets (${meets.length}) exceed recommended limit of ${MAX_RECOMMENDED_CORNER_MEETS}.`,
        pageIndex,
        points: meets
      });
    }
    const violations = checkPatternRules(pattern, grid).violations;
    const rules = violations.map((v) => v.split(":")[0]).filter((r2) => r2 === "disconnected" || r2 === "noEdge");
    if (rules.length > 0) {
      warnings.push({
        code: "advisory.disconnected",
        message: about + (rules.includes("disconnected") ? "The Blocks do not form one connected mass; the guideline Patterns are a single shape." : "The Pattern does not touch any edge of the Page; the guideline Patterns always do."),
        pageIndex,
        rules
      });
    }
    const coverage = violations.find((v) => v.startsWith("coverage:"));
    if (coverage) {
      warnings.push({
        code: "advisory.coverage",
        message: `${about}${deck ? coverage.slice("coverage: ".length) : coverage.slice("coverage: ".length).replace(/^t/, "T")}; the guideline Patterns leave more of the Page open.`,
        pageIndex
      });
    }
    const overlap = measureClearZoneOverlap(page);
    if (!overlap.withinLimit) {
      warnings.push({
        code: "advisory.textOverlap",
        message: about + (overlap.reachesInterior ? "Blocks reach into the middle of the Text zone, where the text sits; they may only nibble its edge." : `Blocks cover ${Math.round(overlap.share * 100)}% of the Text zone; at most ${Math.round(CLEAR_ZONE_MAX_OVERLAP * 100)}% of it, at its edge, may be covered.`),
        pageIndex,
        share: overlap.share,
        reachesInterior: overlap.reachesInterior
      });
    }
    const headline = page.layout && page.layout !== "pattern" ? page.content?.headline : void 0;
    if (!headline) return;
    if (isAllCapsHeadline(headline)) {
      warnings.push({
        code: "advisory.headlineCaps",
        message: "The headline is in ALL CAPS; the guideline sets headlines in sentence case.",
        pageIndex
      });
    }
    const words = countHighlightWords(headline);
    if (words > MAX_HIGHLIGHT_WORDS) {
      warnings.push({
        code: "advisory.highlightWords",
        message: `${words} words are highlighted; the guideline says no more than a few key words (${MAX_HIGHLIGHT_WORDS}).`,
        pageIndex,
        count: words,
        max: MAX_HIGHLIGHT_WORDS
      });
    }
  });
  return warnings;
}

// packages/core/src/execute.ts
function withDensityBlockSettings(before, after) {
  if (before.density === after.density) return after;
  const generator = withoutBlockSettings(after.generator);
  return generator === after.generator ? after : { ...after, generator };
}
var FreeShapeFailed = class extends Error {
};
function markEdited(pages, pageIndex) {
  return pages.map((p, i) => i === pageIndex ? { ...p, edited: true } : p);
}
function applyGridChange(doc, changed, intoArticleCover = false, keepHandEdited = false) {
  const next = fitFreeShapeToGrid(rescaleZone(doc, withDensityDefaults(changed)));
  const oldGrid = gridFor(doc);
  const newGrid = gridFor(next);
  const warnings = [];
  next.pages = next.pages.map((p, i) => {
    if (!intoArticleCover && (!isPageEdited(doc, i) || keepHandEdited && !isHandEdited(doc, i))) {
      const res = regeneratePage(next, i, pageSeed(next, i));
      warnings.push(...res.warnings);
      return { ...res.pages[i], edited: false };
    }
    const direction = fadeDirectionOf(p);
    const pattern = remapPattern(p.pattern, {
      from: { col: 0, row: 0, w: oldGrid.cols, h: oldGrid.rows },
      to: intoArticleCover ? articleCoverPatternArea(next, direction) : { col: 0, row: 0, w: newGrid.cols, h: newGrid.rows },
      fromGrid: oldGrid,
      toGrid: newGrid,
      ...intoArticleCover ? { resolveOverlaps: true, ...p.textZone ? { zone: p.textZone } : {} } : {}
    });
    return { ...p, pattern, edited: true };
  });
  return { document: next, warnings };
}
function generateNextBlockId(doc, preferredId) {
  const existingIds = new Set(doc.pages.flatMap((p) => p.pattern.map((b) => b.id)));
  if (preferredId && !existingIds.has(preferredId)) {
    return preferredId;
  }
  let nextNum = 1;
  for (const id2 of existingIds) {
    const match = id2.match(/^block-(\d+)$/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n >= nextNum) {
        nextNum = n + 1;
      }
    }
  }
  let id = `block-${nextNum}`;
  while (existingIds.has(id)) {
    nextNum++;
    id = `block-${nextNum}`;
  }
  return id;
}
var flatFallback = (pageIndex) => ({
  code: "textZone.flatFallback",
  message: "No single Block could cover the Text zone, so it was kept clear instead.",
  pageIndex
});
var colourPhotoDropped = (pageIndex) => ({
  code: "photo.colourDropped",
  message: "The colour photo was removed, because only an Article cover takes a colour photo. Add a black-and-white photo for this layout.",
  pageIndex
});
function regeneratePage(doc, pageIndex, seed) {
  const page = doc.pages[pageIndex];
  const { blocks, flatFallback: fell, freeShapeFailure } = generatePatternDetailed(
    gridFor(doc),
    getColourway(doc.colourway),
    createRng(seed),
    doc.generator,
    { ...page.textZone ? { textZone: page.textZone } : {}, density: doc.density }
  );
  if (freeShapeFailure) throw new FreeShapeFailed(freeShapeFailure.message);
  return {
    pages: doc.pages.map((p, i) => i === pageIndex ? { ...p, pattern: blocks } : p),
    warnings: fell ? [flatFallback(pageIndex)] : []
  };
}
function regenerateAll(doc, keep = /* @__PURE__ */ new Set()) {
  let cur = doc;
  const warnings = [];
  for (let i = 0; i < doc.pages.length; i++) {
    if (keep.has(i)) continue;
    const res = regeneratePage(cur, i, pageSeed(cur, i));
    cur = { ...cur, pages: res.pages };
    warnings.push(...res.warnings);
  }
  return { pages: cur.pages.map((p, i) => keep.has(i) ? p : { ...p, edited: false }), warnings };
}
function rescaleZone(doc, next) {
  const from = gridFor(doc);
  const to = gridFor(next);
  return {
    ...next,
    pages: next.pages.map((p) => {
      if (p.layout) {
        const zone2 = layoutTextZone(next, p.layout, fadeDirectionOf(p));
        return zone2 ? { ...p, textZone: zone2 } : p;
      }
      const zone = p.textZone;
      if (!zone) return p;
      const col = Math.min(to.cols - 1, Math.round(zone.col * to.cols / from.cols));
      const row = Math.min(to.rows - 1, Math.round(zone.row * to.rows / from.rows));
      const w = Math.min(to.cols - col, Math.max(1, Math.round(zone.w * to.cols / from.cols)));
      const h = Math.min(to.rows - row, Math.max(1, Math.round(zone.h * to.rows / from.rows)));
      return { ...p, textZone: { ...zone, col, row, w, h } };
    })
  };
}
function withDensityDefaults(doc) {
  const grid = gridFor(doc);
  const fallback = { ...doc.generator, blockCount: defaultBlockCountFor(grid) };
  if (!doc.blockCountExplicit) return { ...doc, generator: fallback };
  const { min, max } = doc.generator.freeShape ? freeShapeBlockRanges(grid).blockCount : blockCountRangeFor(grid);
  const { blockCount } = doc.generator;
  if (blockCount >= min && blockCount <= max) return doc;
  return { ...doc, generator: fallback, blockCountExplicit: false };
}
function blockProblem(doc, block) {
  const grid = gridFor(doc);
  if (!isValidBlockSize(block.w, grid.cols) || !isValidBlockSize(block.h, grid.rows)) {
    return {
      rejected: {
        code: "block.sizeNotAllowed",
        message: `Block size ${block.w}x${block.h} is not allowed. Width must be a whole number from 1 to ${grid.cols} and height from 1 to ${grid.rows}.`
      }
    };
  }
  if (block.col < 0 || block.row < 0 || block.col + block.w > grid.cols || block.row + block.h > grid.rows) {
    return {
      rejected: {
        code: "block.outOfGrid",
        message: `Block position (${block.col}, ${block.row}) with size (${block.w}, ${block.h}) is outside grid (${grid.cols}x${grid.rows}).`
      }
    };
  }
  const colourway = getColourway(doc.colourway);
  const tintCount = colourway ? colourway.tints.length : 1;
  if (!Number.isInteger(block.tint) || block.tint < 0 || block.tint >= tintCount) {
    return {
      rejected: {
        code: "block.tintOutOfRange",
        message: `Tint index ${block.tint} is out of range for colourway ${doc.colourway} (0..${tintCount - 1}).`
      }
    };
  }
  return null;
}
var articleCoverLocked = (code, what) => ({
  rejected: {
    code: `articleCover.${code}`,
    message: `An Article cover is always Link preview 1.91:1 at the 32x16 Grid on navy, so its ${what} cannot change. Pick another layout first.`
  }
});
var articleCoverOnePage = () => ({
  rejected: {
    code: "articleCover.onePage",
    message: "An Article cover is a one-Page Document. Remove the other Pages first, or start a new Document."
  }
});
function execute(doc, cmd) {
  let res;
  try {
    res = executeCommand(doc ? materializePages(doc) : doc, cmd);
  } catch (error) {
    if (error instanceof FreeShapeFailed) return { rejected: { code: "freeShape.failed", message: error.message } };
    throw error;
  }
  if ("rejected" in res) return res;
  const document2 = settlePages(res.document);
  return { document: document2, warnings: [...computeWarnings(document2), ...res.warnings] };
}
function executeCommand(doc, cmd) {
  if (cmd.type === "createDocument") {
    const seed = generateRandomSeed();
    const colourway = getColourway(DEFAULT_COLOURWAY_ID);
    const newDoc = {
      version: 1,
      format: "square",
      density: "fine",
      colourway: colourway.id,
      seed,
      generator: defaultGeneratorParams(
        gridFor({ format: "square", density: "fine" })
      ),
      pages: [],
      edited: false
    };
    const first = regeneratePage({ ...newDoc, pages: [{ pattern: [] }] }, 0, seed);
    return {
      document: { ...newDoc, pages: first.pages },
      warnings: []
    };
  }
  if (cmd.type === "generate") {
    if (!doc) {
      return {
        rejected: {
          code: "DOCUMENT_REQUIRED",
          message: "A document is required to generate a pattern. Use createDocument first."
        }
      };
    }
    const colourway = getColourway(doc.colourway);
    if (!colourway) {
      return {
        rejected: {
          code: "colourway.unknown",
          message: `Unknown colourway: ${doc.colourway}`
        }
      };
    }
    const pageIndex = cmd.pageIndex ?? 0;
    if (!doc.pages[pageIndex]) {
      return { rejected: { code: "page.unknown", message: `There is no Page at index ${pageIndex}.` } };
    }
    const seed = cmd.seed !== void 0 ? cmd.seed : generateRandomSeed();
    const seeded = {
      ...doc,
      generator: { ...doc.generator, referenceSet: rollReferenceSet(doc.generator.referenceSet) },
      pages: doc.pages.map((p, i) => i === pageIndex ? { ...p, seed, edited: false } : p)
    };
    const regen = regeneratePage(seeded, pageIndex, seed);
    return { document: { ...seeded, pages: regen.pages }, warnings: regen.warnings };
  }
  if (cmd.type === "setGeneratorParams") {
    if (!doc) {
      return {
        rejected: {
          code: "DOCUMENT_REQUIRED",
          message: "A document is required to set generator params."
        }
      };
    }
    const freeShapeOn = "freeShape" in cmd.params ? cmd.params.freeShape !== void 0 : doc.generator.freeShape !== void 0;
    const problem = validateGeneratorParams(cmd.params, freeShapeOn);
    if (problem) {
      return { rejected: { code: "params.invalid", message: problem } };
    }
    let generator = { ...doc.generator, ...cmd.params };
    if (generator.family === "auto") delete generator.family;
    if ("freeShape" in cmd.params && cmd.params.freeShape === void 0) {
      delete generator.freeShape;
      generator = bringBlockSettingsInside({ ...doc, generator }).generator;
    }
    if ((cmd.params.slope !== void 0 || cmd.params.family !== void 0) && cmd.params.shape === void 0) delete generator.shape;
    if (cmd.params.shape !== void 0) keepOnlyAdjustedShape(generator);
    const formulaProblem = validateFormulaParams(generator, doc.density, gridFor(doc));
    if (formulaProblem) return { rejected: { code: "params.invalid", message: formulaProblem } };
    const freeShapeProblem = generator.freeShape ? validateFreeShape(generator.freeShape, gridFor(doc).cols) : null;
    if (freeShapeProblem) return { rejected: { code: "params.invalid", message: freeShapeProblem } };
    const kept = /* @__PURE__ */ new Set();
    if (cmd.keepHandEdited) doc.pages.forEach((_, i) => isHandEdited(doc, i) && kept.add(i));
    const next = {
      ...doc,
      generator,
      ...cmd.params.blockCount !== void 0 ? { blockCountExplicit: true } : {}
    };
    const regen = regenerateAll(next, kept);
    next.pages = regen.pages;
    return { document: next, warnings: regen.warnings };
  }
  if (cmd.type === "setColourway") {
    if (!doc) {
      return {
        rejected: {
          code: "DOCUMENT_REQUIRED",
          message: "A document is required to set colourway. Use createDocument first."
        }
      };
    }
    const targetColourway = getColourway(cmd.colourway);
    if (!targetColourway) {
      return {
        rejected: {
          code: "colourway.unknown",
          message: `Unknown colourway: ${cmd.colourway}`
        }
      };
    }
    const maxTintIndex = targetColourway.tints.length - 1;
    const newDoc = {
      ...doc,
      colourway: targetColourway.id,
      pages: doc.pages.map((p) => ({
        ...p,
        pattern: p.pattern.map((b) => ({
          ...b,
          tint: Math.min(Math.max(0, b.tint), maxTintIndex)
        }))
      })),
      edited: doc.edited ?? false
    };
    return {
      document: newDoc,
      warnings: []
    };
  }
  if (cmd.type === "setTransparentBackground") {
    if (!doc) {
      return {
        rejected: {
          code: "DOCUMENT_REQUIRED",
          message: "A document is required to set the background. Use createDocument first."
        }
      };
    }
    if (cmd.transparent && holdsArticleCover(doc)) return articleCoverLocked("backgroundLocked", "background");
    const { transparentBackground: _was, ...rest } = doc;
    return { document: cmd.transparent ? { ...rest, transparentBackground: true } : rest, warnings: [] };
  }
  if (cmd.type === "setFormat") {
    if (!doc) {
      return {
        rejected: {
          code: "DOCUMENT_REQUIRED",
          message: "A document is required to set format."
        }
      };
    }
    if (holdsArticleCover(doc)) return articleCoverLocked("formatLocked", "Format");
    const knownFormat = FORMATS.find((f) => f.id === cmd.format);
    if (!knownFormat) {
      return {
        rejected: {
          code: "format.unknown",
          message: `Unknown format: ${cmd.format}`
        }
      };
    }
    if (cmd.format === "custom") {
      const { widthPx, heightPx } = cmd;
      if (typeof widthPx !== "number" || typeof heightPx !== "number" || !Number.isFinite(widthPx) || !Number.isFinite(heightPx) || !Number.isInteger(widthPx) || !Number.isInteger(heightPx) || widthPx < 64 || widthPx > 8e3 || heightPx < 64 || heightPx > 8e3) {
        return {
          rejected: {
            code: "format.invalidSize",
            message: "Custom format requires integer width and height between 64 and 8000 pixels."
          }
        };
      }
    }
    const customSize = cmd.format === "custom" ? { widthPx: cmd.widthPx, heightPx: cmd.heightPx } : void 0;
    const levels = densityLevelsFor(cmd.format, customSize);
    const ciStandardLevel = levels.find((lvl) => lvl.isCiStandard)?.level ?? levels[0]?.level ?? "fine";
    const newDoc = {
      ...doc,
      format: cmd.format,
      density: ciStandardLevel,
      ...customSize ? { customSize } : {},
      edited: doc.edited
    };
    if (cmd.format !== "custom") {
      delete newDoc.customSize;
    }
    return applyGridChange(doc, withDensityBlockSettings(doc, newDoc));
  }
  if (cmd.type === "setDensity") {
    if (!doc) {
      return {
        rejected: {
          code: "DOCUMENT_REQUIRED",
          message: "A document is required to set density."
        }
      };
    }
    if (holdsArticleCover(doc)) return articleCoverLocked("densityLocked", "Density");
    const levels = densityLevelsFor(doc.format, doc.customSize);
    const supported = levels.some((lvl) => lvl.level === cmd.density);
    if (!supported) {
      return {
        rejected: {
          code: "density.unsupported",
          message: `Density level '${cmd.density}' is not supported for format '${doc.format}'.`
        }
      };
    }
    const newDoc = {
      ...doc,
      density: cmd.density,
      edited: doc.edited
    };
    return applyGridChange(doc, withDensityBlockSettings(doc, newDoc), false, cmd.keepHandEdited);
  }
  if (cmd.type === "addBlock") {
    if (!doc) {
      return {
        rejected: {
          code: "DOCUMENT_REQUIRED",
          message: "A document is required to add a block."
        }
      };
    }
    const { block } = cmd;
    const problem = blockProblem(doc, block);
    if (problem) return problem;
    const pageIndex = cmd.pageIndex ?? 0;
    if (!doc.pages[pageIndex]) {
      return { rejected: { code: "page.unknown", message: `There is no Page at index ${pageIndex}.` } };
    }
    const id = generateNextBlockId(doc, block.id);
    const newBlock = {
      id,
      col: block.col,
      row: block.row,
      w: block.w,
      h: block.h,
      tint: block.tint
    };
    const newPages = [...doc.pages];
    newPages[pageIndex] = {
      ...newPages[pageIndex],
      pattern: [...newPages[pageIndex].pattern, newBlock]
    };
    return {
      document: {
        ...doc,
        pages: markEdited(newPages, pageIndex),
        edited: true
      },
      warnings: []
    };
  }
  if (cmd.type === "moveBlock") {
    if (!doc) {
      return {
        rejected: {
          code: "DOCUMENT_REQUIRED",
          message: "A document is required to move a block."
        }
      };
    }
    const pageIndex = cmd.pageIndex ?? 0;
    const page = doc.pages[pageIndex];
    const block = page?.pattern.find((b) => b.id === cmd.id);
    if (!block) {
      return {
        rejected: {
          code: "block.unknown",
          message: `Block with id '${cmd.id}' not found.`
        }
      };
    }
    const grid = gridFor(doc);
    if (cmd.col < 0 || cmd.row < 0 || cmd.col + block.w > grid.cols || cmd.row + block.h > grid.rows) {
      return {
        rejected: {
          code: "block.outOfGrid",
          message: `Block position (${cmd.col}, ${cmd.row}) with size (${block.w}, ${block.h}) is outside grid (${grid.cols}x${grid.rows}).`
        }
      };
    }
    const newPages = doc.pages.map((p, idx) => {
      if (idx !== pageIndex) return p;
      return {
        ...p,
        pattern: p.pattern.map((b) => b.id === cmd.id ? { ...b, col: cmd.col, row: cmd.row } : b)
      };
    });
    return {
      document: {
        ...doc,
        pages: markEdited(newPages, pageIndex),
        edited: true
      },
      warnings: []
    };
  }
  if (cmd.type === "resizeBlock") {
    if (!doc) {
      return {
        rejected: {
          code: "DOCUMENT_REQUIRED",
          message: "A document is required to resize a block."
        }
      };
    }
    const pageIndex = cmd.pageIndex ?? 0;
    const page = doc.pages[pageIndex];
    const block = page?.pattern.find((b) => b.id === cmd.id);
    if (!block) {
      return {
        rejected: {
          code: "block.unknown",
          message: `Block with id '${cmd.id}' not found.`
        }
      };
    }
    const grid = gridFor(doc);
    if (!isValidBlockSize(cmd.w, grid.cols) || !isValidBlockSize(cmd.h, grid.rows)) {
      return {
        rejected: {
          code: "block.sizeNotAllowed",
          message: `Block size ${cmd.w}x${cmd.h} is not allowed. Width must be a whole number from 1 to ${grid.cols} and height from 1 to ${grid.rows}.`
        }
      };
    }
    if (cmd.col < 0 || cmd.row < 0 || cmd.col + cmd.w > grid.cols || cmd.row + cmd.h > grid.rows) {
      return {
        rejected: {
          code: "block.outOfGrid",
          message: `Block position (${cmd.col}, ${cmd.row}) with size (${cmd.w}, ${cmd.h}) is outside grid (${grid.cols}x${grid.rows}).`
        }
      };
    }
    const newPages = doc.pages.map((p, idx) => {
      if (idx !== pageIndex) return p;
      return {
        ...p,
        pattern: p.pattern.map(
          (b) => b.id === cmd.id ? { ...b, col: cmd.col, row: cmd.row, w: cmd.w, h: cmd.h } : b
        )
      };
    });
    return {
      document: {
        ...doc,
        pages: markEdited(newPages, pageIndex),
        edited: true
      },
      warnings: []
    };
  }
  if (cmd.type === "removeBlock") {
    if (!doc) {
      return {
        rejected: {
          code: "DOCUMENT_REQUIRED",
          message: "A document is required to remove a block."
        }
      };
    }
    const pageIndex = cmd.pageIndex ?? 0;
    const page = doc.pages[pageIndex];
    const block = page?.pattern.find((b) => b.id === cmd.id);
    if (!block) {
      return {
        rejected: {
          code: "block.unknown",
          message: `Block with id '${cmd.id}' not found.`
        }
      };
    }
    const newPages = doc.pages.map((p, idx) => {
      if (idx !== pageIndex) return p;
      return {
        ...p,
        pattern: p.pattern.filter((b) => b.id !== cmd.id)
      };
    });
    return {
      document: {
        ...doc,
        pages: markEdited(newPages, pageIndex),
        edited: true
      },
      warnings: []
    };
  }
  if (cmd.type === "setBlockTint") {
    if (!doc) {
      return {
        rejected: {
          code: "DOCUMENT_REQUIRED",
          message: "A document is required to set block tint."
        }
      };
    }
    const pageIndex = cmd.pageIndex ?? 0;
    const page = doc.pages[pageIndex];
    const block = page?.pattern.find((b) => b.id === cmd.id);
    if (!block) {
      return {
        rejected: {
          code: "block.unknown",
          message: `Block with id '${cmd.id}' not found.`
        }
      };
    }
    const colourway = getColourway(doc.colourway);
    const tintCount = colourway ? colourway.tints.length : 1;
    if (!Number.isInteger(cmd.tint) || cmd.tint < 0 || cmd.tint >= tintCount) {
      return {
        rejected: {
          code: "block.tintOutOfRange",
          message: `Tint index ${cmd.tint} is out of range for colourway ${doc.colourway} (0..${tintCount - 1}).`
        }
      };
    }
    const newPages = doc.pages.map((p, idx) => {
      if (idx !== pageIndex) return p;
      return {
        ...p,
        pattern: p.pattern.map((b) => b.id === cmd.id ? { ...b, tint: cmd.tint } : b)
      };
    });
    return {
      document: {
        ...doc,
        pages: markEdited(newPages, pageIndex),
        edited: true
      },
      warnings: []
    };
  }
  if (cmd.type === "setPageLayout" || cmd.type === "setPageContent" || cmd.type === "setPhoto" || cmd.type === "clearPhoto" || cmd.type === "setArticleCover") {
    if (!doc) {
      return {
        rejected: { code: "DOCUMENT_REQUIRED", message: "A document is required to change a Page." }
      };
    }
    const pageIndex = cmd.pageIndex ?? 0;
    const page = doc.pages[pageIndex];
    if (!page) {
      return { rejected: { code: "page.unknown", message: `There is no Page at index ${pageIndex}.` } };
    }
    const withPage = (next) => ({
      ...doc,
      pages: doc.pages.map((p, i) => i === pageIndex ? next : p)
    });
    const withContent = (content) => {
      const { content: _old, ...rest } = page;
      return content ? { ...rest, content } : rest;
    };
    if (cmd.type === "setPageLayout") {
      if (cmd.layout !== "pattern" && !Object.hasOwn(LAYOUT_TABLE, cmd.layout)) {
        return { rejected: { code: "layout.unknown", message: `Unknown Page layout: ${String(cmd.layout)}` } };
      }
      const layout = cmd.layout;
      if (layout === "article-cover") {
        if (doc.pages.length > 1) return articleCoverOnePage();
        const { textZone: _zone2, ...rest2 } = page;
        const { customSize: _size, transparentBackground: _transparent, ...base } = doc;
        return applyGridChange(doc, {
          ...base,
          format: ARTICLE_COVER_FORMAT.format,
          density: ARTICLE_COVER_FORMAT.density,
          pages: [{ ...rest2, layout }]
        }, page.layout !== "article-cover");
      }
      const zone = layoutTextZone(doc, layout);
      const { textZone: _zone, layout: _layout, articleCover: _settings, content: _content, ...rest } = page;
      const content = contentAllowedOn(layout, page.content);
      const dropsColour = content !== page.content;
      const notices = dropsColour ? [colourPhotoDropped(pageIndex)] : [];
      const withLayout = withPage({
        ...rest,
        ...content ? { content } : {},
        ...layout !== "pattern" ? { layout } : {},
        ...zone ? { textZone: zone } : {}
      });
      if (page.edited) {
        const grid = gridFor(doc);
        const pattern = page.layout === "article-cover" ? remapPattern(page.pattern, {
          from: articleCoverPatternArea(doc, fadeDirectionOf(page)),
          to: { col: 0, row: 0, w: grid.cols, h: grid.rows },
          fromGrid: grid,
          toGrid: grid,
          resolveOverlaps: true
        }) : page.pattern;
        return { document: withPage({ ...withLayout.pages[pageIndex], pattern }), warnings: notices };
      }
      const res = regeneratePage(withLayout, pageIndex, pageSeed(withLayout, pageIndex));
      return { document: { ...withLayout, pages: res.pages }, warnings: [...notices, ...res.warnings] };
    }
    if (cmd.type === "setArticleCover") {
      if (page.layout !== "article-cover") {
        return {
          rejected: { code: "articleCover.wrongLayout", message: "Article cover settings apply only to a Page with the Article cover layout." }
        };
      }
      const problem = articleCoverProblem(cmd.settings);
      if (problem) return { rejected: problem };
      const withSettings = { ...page, articleCover: { ...page.articleCover, ...cmd.settings } };
      const from = fadeDirectionOf(page);
      const to = fadeDirectionOf(withSettings);
      if (from === to) return { document: withPage(withSettings), warnings: [] };
      const zone = layoutTextZone(doc, "article-cover", to);
      const grid = gridFor(doc);
      const pattern = remapPattern(page.pattern, {
        from: articleCoverPatternArea(doc, from),
        to: articleCoverPatternArea(doc, to),
        fromGrid: grid,
        toGrid: grid,
        resolveOverlaps: true,
        ...zone ? { zone } : {}
      });
      return { document: withPage({ ...withSettings, ...zone ? { textZone: zone } : {}, pattern, edited: true }), warnings: [] };
    }
    if (cmd.type === "setPageContent") {
      const problem = contentPatchProblem(cmd.content);
      if (problem) return { rejected: problem };
      return { document: withPage(withContent(mergeContent(page.content, cmd.content))), warnings: [] };
    }
    if (cmd.type === "setPhoto") {
      const problem = photoProblem(cmd.photo);
      if (problem) return { rejected: problem };
      if (cmd.photo.colour && page.layout !== "article-cover") return { rejected: COLOUR_PHOTO_REFUSED };
      return { document: withPage(withContent(cleanContent({ ...page.content, photo: cmd.photo }))), warnings: [] };
    }
    return { document: withPage(withContent(withoutPhoto(page.content))), warnings: [] };
  }
  if (cmd.type === "setTextZone" || cmd.type === "clearTextZone") {
    if (!doc) {
      return {
        rejected: {
          code: "DOCUMENT_REQUIRED",
          message: "A document is required to change the text zone."
        }
      };
    }
    let zone;
    if (cmd.type === "setTextZone") {
      const z = cmd.zone;
      const grid = gridFor(doc);
      if (z.mode !== "clear" && z.mode !== "flat") {
        return {
          rejected: { code: "textZone.invalidMode", message: "Text zone mode must be 'clear' or 'flat'." }
        };
      }
      if (![z.col, z.row, z.w, z.h].every(Number.isInteger) || z.w < 1 || z.h < 1 || z.col < 0 || z.row < 0 || z.col + z.w > grid.cols || z.row + z.h > grid.rows) {
        return {
          rejected: {
            code: "textZone.outOfPage",
            message: `Text zone (${z.col}, ${z.row}, ${z.w}x${z.h}) must be at least 1x1 cell and inside the grid (${grid.cols}x${grid.rows}).`
          }
        };
      }
      zone = { col: z.col, row: z.row, w: z.w, h: z.h, mode: z.mode };
    }
    const pageIndex = cmd.pageIndex ?? 0;
    const base = doc.pages[pageIndex];
    if (!base) {
      return { rejected: { code: "page.unknown", message: `There is no Page at index ${pageIndex}.` } };
    }
    const { textZone: _old, ...rest } = base;
    const withZone = {
      ...doc,
      pages: doc.pages.map((p, i) => i === pageIndex ? { ...rest, ...zone ? { textZone: zone } : {} } : p)
    };
    if (base.edited) return { document: withZone, warnings: [] };
    const res = regeneratePage(withZone, pageIndex, pageSeed(withZone, pageIndex));
    return { document: { ...withZone, pages: res.pages }, warnings: res.warnings };
  }
  if (cmd.type === "addPage" || cmd.type === "duplicatePage" || cmd.type === "removePage" || cmd.type === "movePage") {
    if (!doc) {
      return { rejected: { code: "DOCUMENT_REQUIRED", message: "A document is required to change its Pages." } };
    }
    const count = doc.pages.length;
    const isIndex = (v, max, min = 0) => typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;
    const unknownPage = (index) => ({
      rejected: { code: "page.unknown", message: `There is no Page at index ${String(index)} (the Document has ${count}).` }
    });
    if ((cmd.type === "addPage" || cmd.type === "duplicatePage") && (holdsArticleCover(doc) || cmd.type === "addPage" && cmd.layout === "article-cover")) {
      return articleCoverOnePage();
    }
    if (cmd.type === "addPage") {
      if (cmd.layout !== "pattern" && !Object.hasOwn(LAYOUT_TABLE, cmd.layout)) {
        return { rejected: { code: "layout.unknown", message: `Unknown Page layout: ${String(cmd.layout)}` } };
      }
      const after = cmd.afterIndex ?? count - 1;
      if (!isIndex(after, count - 1, -1)) return unknownPage(cmd.afterIndex);
      const zone = layoutTextZone(doc, cmd.layout);
      const seed = nextPageSeed(doc);
      const fresh = {
        ...doc,
        pages: [
          ...doc.pages,
          {
            pattern: [],
            seed,
            edited: false,
            ...cmd.layout !== "pattern" ? { layout: cmd.layout } : {},
            ...zone ? { textZone: zone } : {}
          }
        ]
      };
      const made = regeneratePage(fresh, count, seed);
      const page = made.pages[count];
      const pages2 = [...doc.pages.slice(0, after + 1), page, ...doc.pages.slice(after + 1)];
      return {
        document: { ...doc, pages: pages2 },
        warnings: made.warnings.map((w) => ({ ...w, pageIndex: after + 1 }))
      };
    }
    if (cmd.type === "duplicatePage") {
      if (!isIndex(cmd.pageIndex, count - 1)) return unknownPage(cmd.pageIndex);
      const copy = structuredClone(doc.pages[cmd.pageIndex]);
      return {
        document: { ...doc, pages: [...doc.pages.slice(0, cmd.pageIndex + 1), copy, ...doc.pages.slice(cmd.pageIndex + 1)] },
        warnings: []
      };
    }
    if (cmd.type === "removePage") {
      if (!isIndex(cmd.pageIndex, count - 1)) return unknownPage(cmd.pageIndex);
      if (count === 1) {
        return { rejected: { code: "page.last", message: "The last Page of a Document cannot be removed." } };
      }
      return { document: { ...doc, pages: doc.pages.filter((_, i) => i !== cmd.pageIndex) }, warnings: [] };
    }
    if (!isIndex(cmd.from, count - 1)) return unknownPage(cmd.from);
    if (!isIndex(cmd.to, count - 1)) return unknownPage(cmd.to);
    const pages = [...doc.pages];
    const [moved] = pages.splice(cmd.from, 1);
    pages.splice(cmd.to, 0, moved);
    return { document: { ...doc, pages }, warnings: [] };
  }
  if (cmd.type === "pickCandidate") {
    if (!doc) {
      return { rejected: { code: "DOCUMENT_REQUIRED", message: "A document is required to pick a Candidate." } };
    }
    const pageIndex = cmd.pageIndex ?? 0;
    if (!doc.pages[pageIndex]) {
      return { rejected: { code: "page.unknown", message: `There is no Page at index ${pageIndex}.` } };
    }
    const { seed, pattern } = cmd.candidate;
    if (typeof seed !== "string" || seed === "") {
      return { rejected: { code: "candidate.invalid", message: "A Candidate needs the non-empty seed that drew it." } };
    }
    const ids = /* @__PURE__ */ new Set();
    for (const block of pattern) {
      const problem = blockProblem(doc, block);
      if (problem) return problem;
      if (ids.has(block.id)) {
        return { rejected: { code: "block.duplicateId", message: `Two Blocks of the Candidate share the id ${block.id}.` } };
      }
      ids.add(block.id);
    }
    const pages = doc.pages.map((p, i) => i === pageIndex ? { ...p, pattern, seed, edited: true } : p);
    const generator = { ...doc.generator, referenceSet: rollReferenceSet(doc.generator.referenceSet) };
    return { document: { ...doc, generator, pages }, warnings: [] };
  }
  if (cmd.type === "loadDocument") {
    const validated = validateDocument(cmd.document);
    if ("error" in validated) {
      return {
        rejected: {
          code: validated.error.code,
          message: validated.error.message
        }
      };
    }
    return {
      document: validated.document,
      warnings: []
    };
  }
  return {
    rejected: {
      code: "UNKNOWN_COMMAND",
      message: `Unknown command: ${cmd.type}`
    }
  };
}
function keepOnlyAdjustedShape(generator) {
  const row = generator.shape ? shapeRangeFor(generator.slope, formulaFamilyFor(generator)) : void 0;
  if (!generator.shape || !row) return;
  const kept = Object.entries(generator.shape).filter(([key, value]) => row.settings[key]?.default !== value);
  if (kept.length === 0) delete generator.shape;
  else generator.shape = Object.fromEntries(kept);
}

// packages/core/src/text/path.ts
var COMMAND_ARITY = { M: 2, L: 2, Q: 4, C: 6, Z: 0 };
function parsePath(d) {
  const out = [];
  for (const match of d.matchAll(/([MLQCZ])([^MLQCZ]*)/g)) {
    const c = match[1];
    const body = (match[2] ?? "").trim();
    const v = body === "" ? [] : body.split(/[\s,]+/).map(Number);
    if (v.length !== COMMAND_ARITY[c] || v.some((n) => !Number.isFinite(n))) {
      throw new Error(`Unexpected glyph path segment: ${match[0]}`);
    }
    out.push({ c, v });
  }
  return out;
}
function contours(path) {
  const result = [];
  for (const cmd of path) {
    if (cmd.c === "M") result.push([cmd]);
    else result[result.length - 1]?.push(cmd);
  }
  return result;
}
function extremaT(p) {
  const ts = [];
  if (p.length === 3) {
    const [a, b, c] = p;
    const den = a - 2 * b + c;
    if (den !== 0) ts.push((a - b) / den);
  } else {
    const [a, b, c, d] = p;
    const qa = -a + 3 * b - 3 * c + d;
    const qb = 2 * a - 4 * b + 2 * c;
    const qc = b - a;
    if (Math.abs(qa) < 1e-12) {
      if (qb !== 0) ts.push(-qc / qb);
    } else {
      const disc = qb * qb - 4 * qa * qc;
      if (disc >= 0) {
        const root = Math.sqrt(disc);
        ts.push((-qb + root) / (2 * qa), (-qb - root) / (2 * qa));
      }
    }
  }
  return ts.filter((t) => t > 0 && t < 1);
}
function bezierAt(p, t) {
  const m = 1 - t;
  if (p.length === 3) return m * m * p[0] + 2 * m * t * p[1] + t * t * p[2];
  return m * m * m * p[0] + 3 * m * m * t * p[1] + 3 * m * t * t * p[2] + t * t * t * p[3];
}
function pathBounds(path) {
  let b = null;
  const add = (x, y) => {
    b = b ? { minX: Math.min(b.minX, x), minY: Math.min(b.minY, y), maxX: Math.max(b.maxX, x), maxY: Math.max(b.maxY, y) } : { minX: x, minY: y, maxX: x, maxY: y };
  };
  let cx = 0;
  let cy = 0;
  for (const cmd of path) {
    if (cmd.c === "M" || cmd.c === "L") {
      [cx, cy] = cmd.v;
      add(cx, cy);
    } else if (cmd.c === "Q" || cmd.c === "C") {
      const xs = [cx];
      const ys = [cy];
      for (let i = 0; i < cmd.v.length; i += 2) {
        xs.push(cmd.v[i]);
        ys.push(cmd.v[i + 1]);
      }
      for (const t of extremaT(xs)) add(bezierAt(xs, t), bezierAt(ys, t));
      for (const t of extremaT(ys)) add(bezierAt(xs, t), bezierAt(ys, t));
      cx = xs[xs.length - 1];
      cy = ys[ys.length - 1];
      add(cx, cy);
    }
  }
  return b;
}
function fmt(n) {
  const r2 = Math.round(n * 1e3) / 1e3;
  return String(Object.is(r2, -0) ? 0 : r2);
}
function transformPath(path, scale, originX, originY) {
  let d = "";
  for (const cmd of path) {
    d += cmd.c;
    for (let i = 0; i < cmd.v.length; i += 2) {
      d += `${i ? " " : ""}${fmt(originX + cmd.v[i] * scale)},${fmt(originY - cmd.v[i + 1] * scale)}`;
    }
  }
  return d;
}

// packages/core/src/logo.ts
var LOGO_VIEWBOX = { width: 840, height: 126 };
var LOGO_I_HEIGHT = 124.295;
var LOGO_PATHS = [
  "M0 8.012L0 124.294L18.467 124.294L18.467 74.506L63.874 74.506L63.874 57.116L18.467 57.116L18.467 25.572L72.523 25.572L72.523 8.012L0 8.012Z",
  "M149.373 107.585L149.373 124.295L127.699 124.295C112.728 124.295 103.913 114.237 103.913 100.083L103.913 55.755L78.639 55.755L78.639 38.876L122.38 38.876L122.38 102.129C122.38 106.22 123.377 107.585 127.704 107.585L149.377 107.585L149.373 107.585ZM125.871 25.062L100.089 25.062L100.089 0L125.871 0L125.871 25.062Z",
  "M163.757 124.295L163.757 38.872L182.219 38.872L182.219 51.49L184.048 51.49C187.872 42.623 196.027 37.17 207.336 37.17L208.001 37.17C224.468 37.17 235.615 48.934 235.615 70.415L235.615 124.295L217.153 124.295L217.153 71.95C217.153 59.672 211.164 54.731 202.182 54.731L201.517 54.731C188.874 54.731 182.219 62.913 182.219 75.531L182.219 124.295L163.757 124.295Z",
  "M254.077 124.295L254.077 38.872L272.539 38.872L272.539 51.49L274.368 51.49C278.192 42.623 286.346 37.17 297.656 37.17L298.321 37.17C314.788 37.17 325.935 48.934 325.935 70.415L325.935 124.295L307.473 124.295L307.473 71.95C307.473 59.672 301.484 54.731 292.502 54.731L291.837 54.731C279.193 54.731 272.539 62.913 272.539 75.531L272.539 124.295L254.077 124.295Z",
  "M379.051 126C357.592 126 342.289 113.042 342.289 86.444L342.289 76.897C342.289 50.299 357.592 37.17 379.051 37.17L380.048 37.17C401.507 37.17 416.811 50.299 416.811 76.897L416.811 86.444C416.811 113.042 401.507 126 380.048 126L379.051 126ZM380.048 109.291C392.027 109.291 399.014 103.664 399.014 86.444L399.014 76.897C399.014 59.507 392.027 54.05 380.048 54.05L379.051 54.05C367.072 54.05 360.256 59.507 360.256 76.897L360.256 86.444C360.256 103.664 367.077 109.291 379.051 109.291L380.048 109.291Z",
  "M433.16 124.295L433.16 38.871L449.959 38.871L449.959 50.295L451.788 50.295C453.617 42.452 459.274 37.166 466.925 37.166L467.59 37.166C474.743 37.166 480.732 41.598 483.392 50.295L485.221 50.295C487.881 42.452 493.372 37.166 501.356 37.166L502.021 37.166C511.834 37.166 519.818 44.838 519.818 59.842L519.818 124.29L502.852 124.29L502.852 64.108C502.852 56.266 499.86 53.535 495.533 53.535L494.868 53.535C489.377 53.535 484.889 57.286 484.889 66.664L484.889 124.295L468.089 124.295L468.089 64.108C468.089 56.266 464.93 53.535 460.603 53.535L459.939 53.535C454.448 53.535 449.959 57.286 449.959 66.664L449.959 124.295L433.16 124.295Z",
  "M610.698 86.614L554.143 86.614C554.143 103.664 560.964 109.291 572.938 109.291L573.936 109.291C582.917 109.291 589.073 106.39 591.899 98.718L609.862 98.718C605.536 116.963 591.733 126 573.931 126L572.934 126C551.475 126 536.171 113.042 536.171 86.444L536.171 76.897C536.171 50.299 551.475 37.17 572.934 37.17L573.931 37.17C595.39 37.17 610.694 50.299 610.694 76.897L610.694 86.614L610.698 86.614ZM572.938 54.05C561.795 54.05 555.141 58.822 554.31 73.316L592.735 73.316C591.903 58.822 585.083 54.05 573.94 54.05L572.942 54.05L572.938 54.05Z",
  "M626.968 124.295L626.968 38.872L645.43 38.872L645.43 51.49L647.259 51.49C651.083 42.623 659.238 37.17 670.547 37.17L671.212 37.17C687.679 37.17 698.826 48.934 698.826 70.415L698.826 124.295L680.364 124.295L680.364 71.95C680.364 59.672 674.375 54.731 665.393 54.731L664.728 54.731C652.085 54.731 645.43 62.913 645.43 75.531L645.43 124.295L626.968 124.295Z",
  "M784.391 107.585L798.364 107.585L798.364 124.295L768.423 124.295L767.093 109.461L765.098 109.461C761.44 117.643 752.953 126 738.485 126L737.82 126C723.348 126 713.369 116.282 713.369 101.959L713.369 101.278C713.369 87.125 723.015 79.452 742.479 77.407L766.764 74.681L766.764 72.121C766.764 58.482 761.606 53.706 751.96 53.706L751.295 53.706C742.812 53.706 735.659 56.946 734.661 69.39L716.033 69.39C718.194 46.884 732.666 37.166 751.964 37.166L752.463 37.166C773.423 37.166 784.4 48.589 784.4 71.95L784.4 107.585L784.391 107.585ZM742.475 110.316C754.117 110.316 766.428 101.959 766.76 87.639L745.301 90.025C734.158 91.22 730.829 95.141 730.829 100.768L730.829 101.278C730.829 107.075 734.819 110.316 741.806 110.316L742.471 110.316L742.475 110.316Z",
  "M839.996 98.888L814.713 98.888L814.713 124.29L839.996 124.29L839.996 98.888Z"
];
var LOGO_PATH_DATA = LOGO_PATHS.join("");
var parsed;
var fmt2 = (n) => {
  const r2 = Math.round(n * 1e3) / 1e3;
  return String(Object.is(r2, -0) ? 0 : r2);
};
function logoPathData(x, y, scale) {
  parsed ??= parsePath(LOGO_PATH_DATA);
  let d = "";
  for (const cmd of parsed) {
    d += cmd.c;
    for (let i = 0; i < cmd.v.length; i += 2) {
      d += `${i ? " " : ""}${fmt2(x + cmd.v[i] * scale)},${fmt2(y + cmd.v[i + 1] * scale)}`;
    }
  }
  return d;
}

// packages/core/src/textColour.ts
var TEXT_WHITE = BRAND_COLOURS.white[100];
var TEXT_NAVY = BRAND_COLOURS.navy[100];
function textColourFor(doc, pageIndex, slot) {
  return textColourOnFill(fillUnderSlot(doc, pageIndex, slot).fill);
}
function fillUnderSlot(doc, pageIndex, slot) {
  const fills = pageFills(doc, pageIndex);
  const pattern = doc.pages[pageIndex]?.pattern ?? [];
  const grid = gridFor(doc);
  const col0 = Math.max(0, slot.col);
  const row0 = Math.max(0, slot.row);
  const col1 = Math.min(grid.cols, slot.col + slot.w);
  const row1 = Math.min(grid.rows, slot.row + slot.h);
  const covered = /* @__PURE__ */ new Map();
  let cells = 0;
  for (let c = col0; c < col1; c++) {
    for (let r2 = row0; r2 < row1; r2++) {
      cells++;
      for (let i = pattern.length - 1; i >= 0; i--) {
        const b = pattern[i];
        if (c >= b.col && c < b.col + b.w && r2 >= b.row && r2 < b.row + b.h) {
          covered.set(i, (covered.get(i) ?? 0) + 1);
          break;
        }
      }
    }
  }
  let fill = fills.background;
  let onBlock = false;
  let best = cells - [...covered.values()].reduce((sum, n) => sum + n, 0);
  for (const [i, n] of covered) {
    if (n > best) {
      best = n;
      fill = tintFill(fills, pattern[i].tint);
      onBlock = true;
    }
  }
  return { fill, onBlock };
}
function uniformFillUnder(doc, pageIndex, rect2) {
  const fills = pageFills(doc, pageIndex);
  const pattern = doc.pages[pageIndex]?.pattern ?? [];
  const grid = gridFor(doc);
  const x0 = Math.max(0, rect2.x);
  const y0 = Math.max(0, rect2.y);
  const x1 = Math.min(grid.cols * grid.cellW, rect2.x + rect2.w);
  const y1 = Math.min(grid.rows * grid.cellH, rect2.y + rect2.h);
  if (x1 <= x0 || y1 <= y0) return fills.background;
  const cells = cellsCovering({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, grid);
  let found = null;
  for (let c = cells.col; c < cells.col + cells.w; c++) {
    for (let r2 = cells.row; r2 < cells.row + cells.h; r2++) {
      let fill = fills.background;
      for (let i = pattern.length - 1; i >= 0; i--) {
        const b = pattern[i];
        if (c >= b.col && c < b.col + b.w && r2 >= b.row && r2 < b.row + b.h) {
          fill = tintFill(fills, b.tint);
          break;
        }
      }
      if (found === null) found = fill;
      else if (found !== fill) return null;
    }
  }
  return found;
}

// packages/core/src/logoPlacement.ts
var FALLBACK_ORDER = ["bottom-left", "bottom-right", "top-left", "top-right"];
var overlaps2 = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
function logoPlacement(doc, pageIndex = 0) {
  const page = doc.pages[pageIndex];
  const layout = page?.layout ?? "pattern";
  const direction = fadeDirectionOf(page);
  const { slots } = layoutSlotsFor(doc, layout, direction);
  if (!slots.logo) return void 0;
  const { widthPx, heightPx } = getFormatDimensions(doc);
  const grid = gridFor(doc);
  const defaultCorner = slots.logo.anchor;
  const others = Object.entries(slots).filter(([name]) => name !== "logo" && !(layout === "article-cover" && name === "photo")).map(([, slot]) => slot.px);
  if (layout === "article-cover" && slots.photo) {
    const edge = articleCoverEdge(doc, direction);
    if (edge.axis === "x") others.push({ x: edge.start * grid.cellW, y: slots.photo.px.y, w: edge.room * grid.cellW, h: slots.photo.px.h });
  }
  const attempt = (corner) => {
    const box = logoBox(widthPx, heightPx, corner);
    return { corner, defaultCorner, moved: corner !== defaultCorner, clean: false, onOneFill: false, box, cells: cellsCovering(box, grid) };
  };
  const order = [defaultCorner, ...FALLBACK_ORDER.filter((c) => c !== defaultCorner)];
  const candidates = order.map((corner) => {
    const placement = attempt(corner);
    const padded = withClearSpace(placement.box);
    const freeOfSlots = !others.some((o) => overlaps2(padded, o));
    const onOneFill = uniformFillUnder(doc, pageIndex, placement.box) !== null;
    const clean = freeOfSlots && uniformFillUnder(doc, pageIndex, padded) !== null;
    return { ...placement, clean, onOneFill, freeOfSlots };
  });
  const pick = candidates.find((c) => c.clean) ?? candidates.find((c) => c.freeOfSlots && c.onOneFill);
  const { freeOfSlots: _free, ...chosen } = pick ?? candidates[0];
  return chosen;
}
function withClearSpace(box) {
  const clear = LOGO_I_HEIGHT / LOGO_VIEWBOX.height * box.h;
  return { x: box.x - clear, y: box.y - clear, w: box.w + 2 * clear, h: box.h + 2 * clear };
}
function logoNotch(doc, pageIndex = 0) {
  const page = doc.pages[pageIndex];
  if (page?.layout !== "article-cover" || !page.content?.photo || page.content.logo?.show === false) return void 0;
  const direction = fadeDirectionOf(page);
  if (direction !== "bottom") return void 0;
  const photo = layoutSlotsFor(doc, "article-cover", direction).slots.photo?.cells;
  const placement = logoPlacement(doc, pageIndex);
  if (!photo || !placement) return void 0;
  const cells = cellsCovering(withClearSpace(placement.box), gridFor(doc));
  const col = Math.max(cells.col, photo.col);
  const row = Math.max(cells.row, photo.row);
  const w = Math.min(cells.col + cells.w, photo.col + photo.w) - col;
  const h = Math.min(cells.row + cells.h, photo.row + photo.h) - row;
  return w > 0 && h > 0 ? { col, row, w, h } : void 0;
}

// packages/core/src/text/shaper.ts
var import_hb = __toESM(require_hb(), 1);
var import_hbjs = __toESM(require_hbjs(), 1);
var FACE_IDS = ["trek-regular", "trek-medium", "plex-mono"];
var FACE_FILES = {
  "trek-regular": "FinnomenaTrek-Regular.otf",
  "trek-medium": "FinnomenaTrek-Medium.otf",
  "plex-mono": "IBMPlexMono-Regular.ttf"
};
var PLEX_FACE_FILES = {
  "trek-regular": "IBMPlexSansThai-Regular.ttf",
  "trek-medium": "IBMPlexSansThai-Medium.ttf",
  "plex-mono": "IBMPlexMono-Regular.ttf"
};
var defaultHarfBuzz;
function loadHarfBuzz(options = {}) {
  if (options.hb) return Promise.resolve(options.hb);
  if (options.wasmBinary || options.locateFile) {
    const { wasmBinary, locateFile } = options;
    return (0, import_hb.default)({
      ...wasmBinary ? { wasmBinary } : {},
      ...locateFile ? { locateFile } : {}
    }).then(import_hbjs.default);
  }
  defaultHarfBuzz ??= (0, import_hb.default)().then(import_hbjs.default);
  return defaultHarfBuzz;
}
var UNIT_CACHE_LIMIT = 2e3;
function isThai(cp) {
  return cp >= 3584 && cp <= 3711;
}
function itemizeScripts(text) {
  const runs = [];
  let i = 0;
  while (i < text.length) {
    const cp = text.codePointAt(i);
    const len = cp > 65535 ? 2 : 1;
    const char = text.slice(i, i + len);
    const script = isThai(cp) ? "thai" : /[\p{L}\p{M}]/u.test(char) ? "other" : null;
    const last = runs[runs.length - 1];
    if (script === null) {
      if (last) last.end = i + len;
    } else if (last && last.script === script) {
      last.end = i + len;
    } else {
      runs.push({ start: last ? i : 0, end: i + len, script });
    }
    i += len;
  }
  if (runs.length === 0 && text.length > 0) runs.push({ start: 0, end: text.length, script: "other" });
  return runs;
}
function measureTittle(iGlyph) {
  const parts = contours(iGlyph);
  if (parts.length < 2) throw new Error('The "i" glyph has no separate dot; cannot measure the tittle');
  const boxes = parts.map((c) => pathBounds(c));
  const dot = boxes.reduce((top, b) => b.minY > top.minY ? b : top);
  return dot.maxY - dot.minY;
}
async function createShaper(fonts, options = {}) {
  const hb = await loadHarfBuzz(options);
  const loaded = /* @__PURE__ */ new Map();
  for (const id of FACE_IDS) {
    const bytes = fonts[id];
    if (!bytes) continue;
    const blob = hb.createBlob(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes));
    const face = hb.createFace(blob, 0);
    loaded.set(id, { upem: face.upem, font: hb.createFont(face), face, blob });
  }
  const get = (id) => {
    const f = loaded.get(id);
    if (!f) throw new Error(`Font "${id}" was not given to createShaper`);
    return f;
  };
  const unitCache = /* @__PURE__ */ new Map();
  const pathCache = /* @__PURE__ */ new Map();
  const shapeRun = (f, text, offset, out) => {
    const buffer = hb.createBuffer();
    try {
      buffer.addText(text);
      buffer.guessSegmentProperties();
      hb.shape(f.font, buffer);
      for (const g of buffer.json()) {
        out.push({ glyphId: g.g, cluster: g.cl + offset, advance: g.ax, dx: g.dx, dy: g.dy });
      }
    } finally {
      buffer.destroy();
    }
  };
  const shapeUnits = (id, text) => {
    if (/[\n\r]/.test(text)) {
      throw new Error("shapeUnits takes one line; split on newlines first");
    }
    const key = `${id}\0${text}`;
    const hit = unitCache.get(key);
    if (hit) return hit;
    const f = get(id);
    const glyphs = [];
    for (const run of itemizeScripts(text)) shapeRun(f, text.slice(run.start, run.end), run.start, glyphs);
    if (unitCache.size >= UNIT_CACHE_LIMIT) unitCache.clear();
    unitCache.set(key, glyphs);
    return glyphs;
  };
  const glyphPath = (id, glyphId) => {
    const key = `${id}\0${glyphId}`;
    let path = pathCache.get(key);
    if (!path) {
      path = parsePath(get(id).font.glyphToPath(glyphId));
      pathCache.set(key, path);
    }
    return path;
  };
  const metrics = (id) => {
    const f = get(id);
    if (!f.metrics) {
      const outlineOf = (ch) => glyphPath(id, shapeUnits(id, ch)[0].glyphId);
      const capBounds = pathBounds(outlineOf("H"));
      if (!capBounds) throw new Error(`Font "${id}" has no capital H`);
      f.metrics = { upem: f.upem, capHeight: capBounds.maxY, tittle: measureTittle(outlineOf("i")) };
    }
    return f.metrics;
  };
  const shape = (id, text, size) => {
    const units = shapeUnits(id, text);
    const scale = size / get(id).upem;
    const glyphs = [];
    let pen = 0;
    let missing = 0;
    for (const g of units) {
      if (g.glyphId === 0) missing++;
      glyphs.push({
        glyphId: g.glyphId,
        cluster: g.cluster,
        x: pen * scale,
        advance: g.advance * scale,
        ox: g.dx * scale,
        oy: g.dy ? -g.dy * scale : 0
      });
      pen += g.advance;
    }
    return { face: id, size, text, glyphs, width: pen * scale, missingGlyphs: missing };
  };
  return {
    faces: FACE_IDS.filter((id) => loaded.has(id)),
    has: (id) => loaded.has(id),
    metrics,
    shapeUnits,
    shape,
    glyphPath,
    destroy() {
      for (const f of loaded.values()) {
        f.font.destroy();
        f.face.destroy();
        f.blob.destroy();
      }
      loaded.clear();
      unitCache.clear();
      pathCache.clear();
    }
  };
}

// packages/core/src/text/lineBreak.ts
var segmenter;
function wordSegments(text) {
  segmenter ??= new Intl.Segmenter("th", { granularity: "word" });
  return Array.from(segmenter.segment(text), (s) => ({
    start: s.index,
    end: s.index + s.segment.length,
    wordLike: s.isWordLike === true,
    space: s.segment.trim() === ""
  }));
}
function breakUnits(text) {
  const tokens = wordSegments(text);
  const units = [];
  let openStart = null;
  const attachToPrevious = (end) => {
    const last = units[units.length - 1];
    if (last) {
      last.end = end;
      last.contentEnd = end;
    } else {
      units.push({ start: tokens[0].start, contentEnd: end, end });
    }
  };
  tokens.forEach((t, i) => {
    const before = tokens[i - 1];
    const after = tokens[i + 1];
    if (t.space) {
      if (openStart !== null) {
        attachToPrevious(t.start);
        openStart = null;
      }
      const last = units[units.length - 1];
      if (last) last.end = t.end;
    } else if (t.wordLike) {
      units.push({ start: openStart ?? t.start, contentEnd: t.end, end: t.end });
      openStart = null;
    } else if ((!before || before.space) && after && !after.space) {
      openStart ??= t.start;
    } else if (openStart === null) {
      attachToPrevious(t.end);
    }
  });
  if (openStart !== null) attachToPrevious(text.length);
  return units;
}

// packages/core/src/text/highlight.ts
var HIGHLIGHT_PAD_Y = 2;
var HIGHLIGHT_PAD_X = 1.5;
var WICK_LENGTH = 2;
var WICK_WIDTH = 1;
function parseMarkup(markup) {
  let text = "";
  const runs = [];
  let open = null;
  for (const ch of markup) {
    if (ch === "\r") continue;
    if (ch === "[") {
      open ??= text.length;
    } else if (ch === "]") {
      if (open !== null) {
        if (text.slice(open).trim() !== "") runs.push({ start: open, end: text.length });
        open = null;
      }
    } else {
      text += ch;
    }
  }
  return { text, runs };
}
var wordSegmenter2;
function countHighlightedWords(markup) {
  wordSegmenter2 ??= new Intl.Segmenter("th", { granularity: "word" });
  const { text, runs } = parseMarkup(markup);
  let count = 0;
  for (const run of runs) {
    for (const s of wordSegmenter2.segment(text.slice(run.start, run.end))) if (s.isWordLike) count++;
  }
  return count;
}
function penAt(line, offset) {
  const glyph = line.glyphs.find((g) => g.cluster >= offset);
  return glyph ? glyph.pen : line.x + line.width;
}
function highlightGeometry(text, lines, runs, unit, capHeight) {
  const segments = [];
  runs.forEach((run, runIndex) => {
    const own = [];
    lines.forEach((line, lineIndex) => {
      let a = Math.max(run.start, line.start);
      let b = Math.min(run.end, line.end);
      while (a < b && /\s/.test(text[a])) a++;
      while (b > a && /\s/.test(text[b - 1])) b--;
      if (a >= b) return;
      const left = penAt(line, a) - HIGHLIGHT_PAD_X * unit;
      const right = penAt(line, b) + HIGHLIGHT_PAD_X * unit;
      const top = line.baseline - capHeight - HIGHLIGHT_PAD_Y * unit;
      const bottom = line.baseline + HIGHLIGHT_PAD_Y * unit;
      own.push({
        run: runIndex,
        line: lineIndex,
        first: false,
        last: false,
        box: { x: left, y: top, width: right - left, height: bottom - top },
        wickBottomLeft: null,
        wickTopRight: null
      });
    });
    const first = own[0];
    const last = own[own.length - 1];
    if (first) {
      first.first = true;
      first.wickTopRight = {
        x: first.box.x + first.box.width - WICK_WIDTH * unit,
        y: first.box.y - WICK_LENGTH * unit,
        width: WICK_WIDTH * unit,
        height: WICK_LENGTH * unit
      };
    }
    if (last) {
      last.last = true;
      last.wickBottomLeft = {
        x: last.box.x,
        y: last.box.y + last.box.height,
        width: WICK_WIDTH * unit,
        height: WICK_LENGTH * unit
      };
    }
    segments.push(...own);
  });
  return segments;
}

// packages/core/src/text/layout.ts
var TYPE_STYLES = {
  headline: { face: "trek-medium", leading: 1.05 },
  secondary: { face: "trek-regular", leading: 1.2 },
  mono: { face: "plex-mono", leading: 1.2 }
};
function prepareText(shaper, markup, face) {
  const { text, runs } = parseMarkup(markup);
  const m = shaper.metrics(face);
  const paragraphs = [];
  let offset = 0;
  let missing = 0;
  for (const part of text.split("\n")) {
    const glyphs = shaper.shapeUnits(face, part);
    const prefix = [0];
    for (const g of glyphs) prefix.push(prefix[prefix.length - 1] + g.advance);
    const firstGlyph = new Array(part.length + 1);
    let gi = 0;
    for (let o = 0; o <= part.length; o++) {
      while (gi < glyphs.length && glyphs[gi].cluster < o) gi++;
      firstGlyph[o] = gi;
    }
    missing += glyphs.filter((g) => g.glyphId === 0).length;
    const local = runs.map((r2) => ({ start: Math.max(r2.start - offset, 0), end: Math.min(r2.end - offset, part.length) })).filter((r2) => r2.end > r2.start);
    paragraphs.push({ offset, text: part, glyphs, prefix, firstGlyph, units: breakUnits(part), runs: local });
    offset += part.length + 1;
  }
  return { face, text, runs, paragraphs, upem: m.upem, capHeight: m.capHeight, tittle: m.tittle, missingGlyphs: missing };
}
function wrapUnits(p, maxUnits, span) {
  if (p.runs.length === 0) return p.units;
  const inside = (u) => p.runs.some((r2) => r2.start < u.start && u.start < r2.end);
  const out = [];
  for (let i = 0; i < p.units.length; ) {
    let j = i + 1;
    while (j < p.units.length && inside(p.units[j])) j++;
    const first = p.units[i];
    const last = p.units[j - 1];
    if (j - i > 1 && span(first.start, last.contentEnd) <= maxUnits) {
      out.push({ start: first.start, contentEnd: last.contentEnd, end: last.end });
    } else {
      out.push(...p.units.slice(i, j));
    }
    i = j;
  }
  return out;
}
function wrap(p, maxUnits) {
  const span = (a, b) => p.prefix[p.firstGlyph[b]] - p.prefix[p.firstGlyph[a]];
  if (p.units.length === 0) return [{ start: 0, end: 0, overflows: false }];
  const units = wrapUnits(p, maxUnits, span);
  const lines = [];
  let start = units[0].start;
  let end = units[0].contentEnd;
  for (let i = 1; i < units.length; i++) {
    const u = units[i];
    if (span(start, u.contentEnd) <= maxUnits) {
      end = u.contentEnd;
    } else {
      lines.push({ start, end, overflows: span(start, end) > maxUnits });
      start = u.start;
      end = u.contentEnd;
    }
  }
  lines.push({ start, end, overflows: span(start, end) > maxUnits });
  return lines;
}
function layoutPrepared(shaper, prepared, options) {
  const { size, leading, width: boxWidth, align = "left" } = options;
  if (!(size > 0)) throw new RangeError("Text size must be positive");
  if (!(leading > 0)) throw new RangeError("Leading must be positive");
  const scale = size / prepared.upem;
  const capHeight = prepared.capHeight * scale;
  const lineHeight = size * leading;
  const lines = [];
  for (const p of prepared.paragraphs) {
    for (const l of wrap(p, boxWidth / scale)) {
      const g0 = p.firstGlyph[l.start];
      const g1 = p.firstGlyph[l.end];
      const origin = p.prefix[g0];
      const width = (p.prefix[g1] - origin) * scale;
      const x = align === "left" || !Number.isFinite(boxWidth) ? 0 : (boxWidth - width) * (align === "right" ? 1 : 0.5);
      const baseline = capHeight + lines.length * lineHeight;
      const glyphs = [];
      for (let i = g0; i < g1; i++) {
        const g = p.glyphs[i];
        const pen = x + (p.prefix[i] - origin) * scale;
        glyphs.push({
          glyphId: g.glyphId,
          cluster: p.offset + g.cluster,
          pen,
          advance: g.advance * scale,
          x: pen + g.dx * scale,
          y: g.dy ? baseline - g.dy * scale : baseline
        });
      }
      lines.push({
        text: p.text.slice(l.start, l.end),
        start: p.offset + l.start,
        end: p.offset + l.end,
        x,
        width,
        baseline,
        glyphs,
        overflows: l.overflows
      });
    }
  }
  const unit = prepared.tittle * scale;
  return {
    face: prepared.face,
    size,
    leading,
    boxWidth,
    text: prepared.text,
    lines,
    lineHeight,
    capHeight,
    unit,
    width: lines.reduce((w, l) => Math.max(w, l.width), 0),
    height: capHeight + (lines.length - 1) * lineHeight,
    overflowX: lines.some((l) => l.overflows),
    missingGlyphs: prepared.missingGlyphs,
    highlights: highlightGeometry(prepared.text, lines, prepared.runs, unit, capHeight)
  };
}
function layoutText(shaper, markup, options) {
  return layoutPrepared(shaper, prepareText(shaper, markup, options.face), options);
}
function fitText(shaper, markup, options) {
  const prepared = prepareText(shaper, markup, options.face);
  const min = Math.max(1, Math.ceil(options.minSize ?? 1));
  const { maxSize, width, height, leading, align } = options;
  let layout;
  for (let size = Math.max(min, Math.floor(maxSize)); size >= min; size--) {
    layout = layoutPrepared(shaper, prepared, { size, leading, width, align });
    if (!layout.overflowX && layout.height <= height + 1e-6) return { size, fits: true, layout };
  }
  return { size: layout.size, fits: false, layout };
}
function layoutOutline(shaper, layout, originX = 0, originY = 0) {
  const scale = layout.size / shaper.metrics(layout.face).upem;
  const parts = [];
  for (const line of layout.lines) {
    for (const g of line.glyphs) {
      const d = transformPath(shaper.glyphPath(layout.face, g.glyphId), scale, originX + g.x, originY + g.y);
      if (d) parts.push(d);
    }
  }
  return parts.join("");
}

// packages/core/src/composedScene.ts
var TICKER_HEIGHT_OF_CAP = 2;
var HEADLINE_MAX_OF_SHORT = {
  headline: 0.12,
  cover: 0.09,
  "product-cover": 0.1,
  "section-divider": 0.12,
  content: 0.08,
  closing: 0.12,
  // Prototype verdict on #67: 12% of the short side.
  "article-cover": 0.12
};
var SECONDARY_OF_HEADLINE = 0.4;
var SECONDARY_MAX_OF_SHORT = 0.035;
var CONTENT_SECONDARY_MAX_OF_SHORT = 0.04;
var LABEL_MAX_OF_SHORT = 0.025;
var TICKER_MAX_OF_SHORT = 0.03;
var PLACEMENT = {
  cover: { label: { v: "bottom", align: "right" } },
  "product-cover": { headline: { v: "bottom" } },
  "article-cover": { headline: { v: "bottom" } }
};
var rectOf = (x, y, w, h, fill) => ({ x, y, w, h, fill });
function monoFace(shaper, text) {
  if (shaper.has("plex-mono")) {
    const run = shaper.shape("plex-mono", text.replace(/[[\]\n\r]/g, ""), 10);
    if (run.missingGlyphs === 0) return "plex-mono";
  }
  return shaper.has("trek-regular") ? "trek-regular" : null;
}
var THAI = /[\u0E00-\u0E7F]/;
var reachEm = (text) => THAI.test(text) ? { top: 0.38, bottom: 0.28 } : { top: 0.08, bottom: 0.22 };
function fitInSlot(shaper, markup, face, leading, slot, maxSize, align, highlights = false) {
  const prepared = prepareText(shaper, markup, face);
  const reach = reachEm(prepared.text);
  const hasRuns = highlights && prepared.runs.length > 0;
  let fitted;
  for (let size = Math.max(1, Math.floor(maxSize)); size >= 1; size--) {
    const unit = prepared.tittle * size / prepared.upem;
    const width = slot.w - (hasRuns ? 1.5 * unit : 0);
    const layout = layoutPrepared(shaper, prepared, { size, leading, width, align });
    let top = reach.top * size;
    let bottom = reach.bottom * size;
    let left = 0;
    for (const h of highlights ? layout.highlights : []) {
      top = Math.max(top, -h.box.y, h.wickTopRight ? -h.wickTopRight.y : 0);
      bottom = Math.max(bottom, h.box.y + h.box.height - layout.height, h.wickBottomLeft ? h.wickBottomLeft.y + h.wickBottomLeft.height - layout.height : 0);
      left = Math.max(left, -h.box.x);
    }
    fitted = { layout, top, bottom, left };
    if (!layout.overflowX && layout.height + top + bottom <= slot.h + 1e-6) break;
  }
  return fitted;
}
function originOf(f, slot, v) {
  return {
    x: slot.x + Math.max(0, f.left - slot.x),
    y: v === "bottom" ? slot.y + slot.h - f.bottom - f.layout.height : slot.y + f.top
  };
}
function sceneLines(layout, origin, fill, align, runsOf) {
  return layout.lines.filter((line) => line.text !== "").map((line) => ({
    text: line.text,
    runs: runsOf ? runsOf(line) : [{ text: line.text, fill }],
    x: origin.x + line.x,
    baselineY: origin.y + line.baseline,
    fontSize: layout.size,
    face: layout.face,
    fill,
    width: line.width,
    align
  }));
}
function composePhoto(doc, pageIndex) {
  const page = doc.pages[pageIndex] ?? { pattern: [] };
  const content = page.content ?? {};
  const photoSlot = layoutSlots(doc, pageIndex).slots.photo;
  if (!content.photo || !photoSlot) return void 0;
  const grid = gridFor(doc);
  const fills = pageFills(doc, pageIndex);
  const { x, y, w, h } = photoSlot.px;
  const { width: iw, height: ih } = content.photo;
  const crop = { left: 0, top: 0, right: 0, bottom: 0 };
  if (iw > 0 && ih > 0 && w > 0 && h > 0) {
    const scale = Math.max(w / iw, h / ih);
    const shareX = Math.min(1, w / scale / iw);
    const shareY = Math.min(1, h / scale / ih);
    crop.left = crop.right = (1 - shareX) / 2;
    crop.top = crop.bottom = (1 - shareY) / 2;
  }
  const photo = { x, y, w, h, href: content.photo.src, width: iw, height: ih, crop };
  if (page.layout === "article-cover") {
    photo.underBlocks = true;
    const { photoEdge, fadeLength } = articleCoverSettings(page);
    const direction = fadeDirectionOf(page);
    const edge = articleCoverEdge(doc, direction);
    if (photoEdge === "step") {
      photo.cuts = stepEdgeCuts(photoSlot.cells, fadeLength, edge).map(
        (c) => rectOf(c.col * grid.cellW, c.row * grid.cellH, c.w * grid.cellW, c.h * grid.cellH, fills.background)
      );
    } else {
      const ramp = fadeRampCells(fadeLength, edge.room);
      const colour = fills.background;
      photo.fade = edge.axis === "y" ? { direction, start: edge.start * grid.cellH, end: (edge.start - ramp) * grid.cellH, colour, curve: "smoothstep" } : { direction, start: edge.start * grid.cellW, end: (edge.start + ramp) * grid.cellW, colour, curve: "smoothstep" };
    }
    const notch = logoNotch(doc, pageIndex);
    if (notch) {
      photo.notch = rectOf(notch.col * grid.cellW, notch.row * grid.cellH, notch.w * grid.cellW, notch.h * grid.cellH, fills.background);
      if (photo.fade) photo.fade.notch = { x: photo.notch.x, y: photo.notch.y, w: photo.notch.w, h: photo.notch.h };
    }
  }
  return photo;
}
function composeScene(doc, pageIndex, shaper, options = {}) {
  const withOutlines = options.outlines !== false;
  const page = doc.pages[pageIndex] ?? { pattern: [] };
  const layoutId = page.layout ?? "pattern";
  const content = page.content ?? {};
  const grid = gridFor(doc);
  const fills = pageFills(doc, pageIndex);
  const { widthPx: width, heightPx: height } = getFormatDimensions(doc);
  const short = Math.min(width, height);
  const { slots } = layoutSlots(doc, pageIndex);
  const placement = PLACEMENT[layoutId] ?? {};
  const blocks = [];
  for (const block of page.pattern) {
    const fill = tintFill(fills, block.tint);
    blocks.push(rectOf(block.col * grid.cellW, block.row * grid.cellH, block.w * grid.cellW, block.h * grid.cellH, fill));
  }
  const photo = composePhoto(doc, pageIndex);
  const texts = [];
  const highlights = [];
  const wicks = [];
  const headlineSlot = slots.headline;
  const headlineMarkup = content.headline?.trim() ?? "";
  let headlineSize;
  if (headlineMarkup && headlineSlot && layoutId !== "pattern" && shaper.has(TYPE_STYLES.headline.face)) {
    const slot = headlineSlot.px;
    const align = placement.headline?.align ?? "left";
    const style = TYPE_STYLES.headline;
    const fitted = fitInSlot(shaper, headlineMarkup, style.face, style.leading, slot, short * HEADLINE_MAX_OF_SHORT[layoutId], align, true);
    const layout = fitted.layout;
    headlineSize = layout.size;
    const { x, y } = originOf(fitted, slot, placement.headline?.v ?? "top");
    const colour = textColourFor(doc, pageIndex, headlineSlot.cells);
    const under = fillUnderSlot(doc, pageIndex, headlineSlot.cells);
    const highlightFill = layoutId === "article-cover" ? highlightHex(articleCoverSettings(page).highlight) : under.onBlock ? fills.background : fills.tints[0] ?? fills.background;
    const highlightColour = textColourOnFill(highlightFill);
    for (const s of layout.highlights) {
      highlights.push(rectOf(x + s.box.x, y + s.box.y, s.box.width, s.box.height, highlightFill));
      for (const wick of [s.wickBottomLeft, s.wickTopRight]) {
        if (wick) wicks.push(rectOf(x + wick.x, y + wick.y, wick.width, wick.height, highlightFill));
      }
    }
    const { runs } = parseMarkup(headlineMarkup);
    const inRun = (offset) => runs.some((r2) => offset >= r2.start && offset < r2.end);
    const split = (keep) => ({
      ...layout,
      lines: layout.lines.map((line) => ({ ...line, glyphs: line.glyphs.filter((g) => inRun(g.cluster) === keep) }))
    });
    const outlines = [];
    if (withOutlines) {
      outlines.push({ role: "headline", d: layoutOutline(shaper, split(false), x, y), fill: colour });
      if (runs.length > 0) outlines.push({ role: "headline-highlight", d: layoutOutline(shaper, split(true), x, y), fill: highlightColour });
    }
    const runsOf = (line) => {
      const pieces = [];
      for (let o = line.start; o < line.end; o++) {
        const fill = inRun(o) ? highlightColour : colour;
        const char = layout.text[o];
        const last = pieces[pieces.length - 1];
        if (last && last.fill === fill) last.text += char;
        else pieces.push({ text: char, fill });
      }
      return pieces;
    };
    texts.push({ role: "headline", lines: sceneLines(layout, { x, y }, colour, align, runsOf), outlines });
  }
  const secondary = content.secondary?.trim();
  if (secondary && slots.secondary && shaper.has(TYPE_STYLES.secondary.face)) {
    texts.push(
      fitSlotText(doc, pageIndex, shaper, "secondary", secondary, TYPE_STYLES.secondary.face, slots.secondary, withOutlines, {
        maxSize: layoutId === "content" ? short * CONTENT_SECONDARY_MAX_OF_SHORT : headlineSize ? Math.round(headlineSize * SECONDARY_OF_HEADLINE) : short * SECONDARY_MAX_OF_SHORT,
        leading: TYPE_STYLES.secondary.leading
      })
    );
  }
  const label = content.label?.trim();
  const labelFace = label ? monoFace(shaper, label) : null;
  if (label && slots.label && labelFace) {
    texts.push(
      fitSlotText(doc, pageIndex, shaper, "label", label, labelFace, slots.label, withOutlines, {
        maxSize: short * LABEL_MAX_OF_SHORT,
        leading: TYPE_STYLES.mono.leading,
        align: placement.label?.align,
        bottom: placement.label?.v === "bottom"
      })
    );
  }
  let ticker;
  const tickerContent = content.ticker;
  const oneLine = (t) => parseMarkup(t ?? "").text.replace(/\s+/g, " ").trim();
  const left = oneLine(tickerContent?.left);
  const right = oneLine(tickerContent?.right);
  if (tickerContent?.show && slots.ticker && (left || right)) {
    const faceOf = monoFace(shaper, `${left}${right}`);
    if (faceOf) {
      const navyBackground = fills.background.toUpperCase() === TEXT_NAVY.toUpperCase();
      const stripFill = navyBackground ? TEXT_WHITE : TEXT_NAVY;
      const textFill = navyBackground ? TEXT_NAVY : TEXT_WHITE;
      const slot = slots.ticker.px;
      const m = shaper.metrics(faceOf);
      const capRatio = m.capHeight / m.upem;
      const pad = headlineSlot?.px.x ?? short * 0.05;
      let size = Math.floor(Math.min(slot.h / (TICKER_HEIGHT_OF_CAP * capRatio), short * TICKER_MAX_OF_SHORT));
      const need = (s) => (left ? shaper.shape(faceOf, left, s).width : 0) + (right ? shaper.shape(faceOf, right, s).width : 0) + (left && right ? 2 * s : 0);
      while (size > 1 && need(size) > width - 2 * pad) size--;
      const cap = capRatio * size;
      const stripH = TICKER_HEIGHT_OF_CAP * cap;
      const stripY = slot.y + (slot.h - stripH) / 2;
      const style = { face: faceOf, size, leading: TYPE_STYLES.mono.leading, width: Infinity };
      const textY = stripY + (stripH - cap) / 2;
      const tickerTexts = [];
      if (left) {
        const l = layoutText(shaper, left, style);
        const origin = { x: pad, y: textY };
        tickerTexts.push({
          role: "ticker-left",
          lines: sceneLines(l, origin, textFill, "left"),
          outlines: withOutlines ? [{ role: "ticker-left", d: layoutOutline(shaper, l, origin.x, origin.y), fill: textFill }] : []
        });
      }
      if (right) {
        const l = layoutText(shaper, right, style);
        const origin = { x: width - pad - l.width, y: textY };
        tickerTexts.push({
          role: "ticker-right",
          lines: sceneLines(l, origin, textFill, "right"),
          outlines: withOutlines ? [{ role: "ticker-right", d: layoutOutline(shaper, l, origin.x, origin.y), fill: textFill }] : []
        });
      }
      ticker = { strip: rectOf(0, stripY, width, stripH, stripFill), texts: tickerTexts };
    }
  }
  let logo;
  const logoAt = logoPlacement(doc, pageIndex);
  if (logoAt && content.logo?.show !== false) {
    const { box } = logoAt;
    logo = { x: box.x, y: box.y, w: box.w, h: box.h, fill: textColourFor(doc, pageIndex, logoAt.cells) };
  }
  const scene = { width, height, blocks, highlights, wicks, texts };
  if (!doc.transparentBackground) scene.background = fills.background;
  if (photo) scene.photo = photo;
  if (ticker) scene.ticker = ticker;
  if (logo) scene.logo = logo;
  return scene;
}
function fitSlotText(doc, pageIndex, shaper, role, markup, face, slot, withOutlines, opts) {
  const align = opts.align ?? "left";
  const fitted = fitInSlot(shaper, markup, face, opts.leading, slot.px, opts.maxSize, align);
  const origin = originOf(fitted, slot.px, opts.bottom ? "bottom" : "top");
  const fill = textColourFor(doc, pageIndex, slot.cells);
  return {
    role,
    lines: sceneLines(fitted.layout, origin, fill, align),
    outlines: withOutlines ? [{ role, d: layoutOutline(shaper, fitted.layout, origin.x, origin.y), fill }] : []
  };
}

// packages/core/src/photoBake.ts
var smoothstep = (t) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};
var hexRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
function bakeFade(photo, fade, slot) {
  const { width, height } = photo;
  const [br, bg, bb] = hexRgb(fade.colour);
  const out = new Uint8Array(width * height * 4);
  const alongY = fade.direction === "bottom";
  const span = fade.end - fade.start;
  const weightAt = (page) => {
    if (span === 0) return (alongY ? page <= fade.end : page >= fade.end) ? 1 : 0;
    return smoothstep((page - fade.start) / span);
  };
  const weights = Array.from(
    { length: alongY ? height : width },
    (_, n) => alongY ? weightAt(slot.y + (n + 1) * slot.h / height) : weightAt(slot.x + n * slot.w / width)
  );
  const notch = fade.notch;
  const inside = (n, count, from, size, lo, hi) => from + n * size / count >= lo - 1e-9 && from + (n + 1) * size / count <= hi + 1e-9;
  const inNotchX = Array.from({ length: width }, (_, x) => !!notch && inside(x, width, slot.x, slot.w, notch.x, notch.x + notch.w));
  const inNotchY = Array.from({ length: height }, (_, y) => !!notch && inside(y, height, slot.y, slot.h, notch.y, notch.y + notch.h));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const k = inNotchX[x] && inNotchY[y] ? 0 : weights[alongY ? y : x];
      const i = (y * width + x) * 4;
      const a = photo.data[i + 3] / 255;
      out[i] = Math.round(br + (photo.data[i] - br) * a * k);
      out[i + 1] = Math.round(bg + (photo.data[i + 1] - bg) * a * k);
      out[i + 2] = Math.round(bb + (photo.data[i + 2] - bb) * a * k);
      out[i + 3] = 255;
    }
  }
  return { width, height, data: out };
}
var PhotoBakeError = class extends Error {
  code = "photo.bakeUnavailable";
  constructor(message) {
    super(message);
    this.name = "PhotoBakeError";
  }
};
function bakeRequestOf(photo) {
  if (!photo?.fade) return null;
  return {
    href: photo.href,
    width: photo.width,
    height: photo.height,
    crop: photo.crop,
    slot: { x: photo.x, y: photo.y, w: photo.w, h: photo.h },
    fade: photo.fade
  };
}
var photoBakeRequest = (doc, pageIndex) => bakeRequestOf(composePhoto(doc, pageIndex));
function photoBakeCrop(request) {
  const { width, height, crop } = request;
  const x = Math.min(width - 1, Math.round(width * crop.left));
  const y = Math.min(height - 1, Math.round(height * crop.top));
  return {
    x,
    y,
    w: Math.max(1, Math.min(width - x, Math.round(width * (1 - crop.left - crop.right)))),
    h: Math.max(1, Math.min(height - y, Math.round(height * (1 - crop.top - crop.bottom))))
  };
}
var photoBakeKey = (request) => JSON.stringify([request.width, request.height, request.crop, request.slot, request.fade]);

// packages/core/src/composedRenderer.ts
var fmt3 = (n) => {
  const r2 = Math.round(n * 1e3) / 1e3;
  return String(Object.is(r2, -0) ? 0 : r2);
};
var escapeAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
var rect = (role, r2) => `<rect data-role="${role}" x="${fmt3(r2.x)}" y="${fmt3(r2.y)}" width="${fmt3(r2.w)}" height="${fmt3(r2.h)}" fill="${r2.fill}"/>`;
var pathEl = (o) => o.d ? `<path data-role="${o.role}" d="${o.d}" fill="${o.fill}"/>` : "";
var outlinesOf = (texts) => texts.flatMap((t) => t.outlines.map(pathEl));
function sceneToSvg(scene, baker) {
  const { width, height } = scene;
  const photo = scene.photo;
  const photoUnderBlocks = photo?.underBlocks === true;
  const background = scene.background ? [`<rect width="${width}" height="${height}" fill="${scene.background}"/>`] : [];
  const blocks = scene.blocks.map((b) => `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${b.fill}"/>`);
  const photoEls = () => {
    if (!photo) return [];
    const id = "fnm-photo-clip";
    let href = photo.href;
    let fit = "xMidYMid slice";
    const request = bakeRequestOf(photo);
    if (request) {
      if (!baker) throw new PhotoBakeError("This photo has a fade, which has to be baked into the image before it is written. Give the renderer a photo baker.");
      const baked = baker.baked(request);
      if (baked === void 0) throw new PhotoBakeError("The photo is not baked yet. Wait for its fade to be baked, then draw again.");
      href = baked;
      fit = "none";
    }
    const els = [
      `<clipPath id="${id}"><rect x="${fmt3(photo.x)}" y="${fmt3(photo.y)}" width="${fmt3(photo.w)}" height="${fmt3(photo.h)}"/></clipPath><image data-role="photo" href="${escapeAttr(href)}" x="${fmt3(photo.x)}" y="${fmt3(photo.y)}" width="${fmt3(photo.w)}" height="${fmt3(photo.h)}" preserveAspectRatio="${fit}" clip-path="url(#${id})"/>`
    ];
    if (photo.cuts?.length) els.push(`<g shape-rendering="crispEdges">${photo.cuts.map((c) => rect("photo-cut", c)).join("")}</g>`);
    if (photo.notch) els.push(`<g shape-rendering="crispEdges">${rect("photo-notch", photo.notch)}</g>`);
    return els;
  };
  const out = [];
  if (photoUnderBlocks) {
    out.push(`<g shape-rendering="crispEdges">${background.join("")}</g>`, ...photoEls(), `<g shape-rendering="crispEdges">${blocks.join("")}</g>`);
  } else {
    out.push(`<g shape-rendering="crispEdges">${[...background, ...blocks].join("")}</g>`, ...photoEls());
  }
  const highlightRects = [...scene.highlights.map((r2) => rect("highlight", r2)), ...scene.wicks.map((r2) => rect("wick", r2))];
  out.push(`<g shape-rendering="crispEdges">${highlightRects.join("")}</g>`);
  out.push(...outlinesOf(scene.texts));
  if (scene.ticker) {
    out.push(`<g shape-rendering="crispEdges">${rect("ticker-strip", scene.ticker.strip)}</g>`);
    out.push(...outlinesOf(scene.ticker.texts));
  }
  const logo = scene.logo;
  if (logo) {
    const scale = logo.w / LOGO_VIEWBOX.width;
    out.push(pathEl({ role: "logo", d: logoPathData(logo.x, logo.y, scale), fill: logo.fill }));
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${out.join("")}</svg>`;
}
function renderComposed(doc, pageIndex, shaper, baker) {
  return sceneToSvg(composeScene(doc, pageIndex, shaper), baker);
}

// packages/core/src/renderer.ts
function renderSvg(doc, pageIndex = 0, options = {}) {
  const page = doc.pages[pageIndex] ?? { pattern: [] };
  if (options.shaper && page.layout && page.layout !== "pattern") {
    return renderComposed(doc, pageIndex, options.shaper, options.photoBaker);
  }
  const grid = gridFor(doc);
  const fills = pageFills(doc, pageIndex);
  const { widthPx: width, heightPx: height } = getFormatDimensions(doc);
  const rects = [];
  if (!doc.transparentBackground) rects.push(`<rect width="${width}" height="${height}" fill="${fills.background}"/>`);
  for (const block of page.pattern) {
    const x = block.col * grid.cellW;
    const y = block.row * grid.cellH;
    const w = block.w * grid.cellW;
    const h = block.h * grid.cellH;
    const fill = tintFill(fills, block.tint);
    rects.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${rects.join("")}</svg>`;
}

// packages/core/src/export.ts
function exportFileName(doc, ext, options) {
  const sanitize = (val) => val.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  const safeFormat = sanitize(doc.format || "square") || "square";
  const safeColourway = sanitize(doc.colourway || "navy-yellow") || "navy-yellow";
  const safeSeed = sanitize(doc.seed || "seed") || "seed";
  const cleanExt = ext.replace(/^\.+/, "").replace(/[^a-zA-Z0-9]/g, "");
  const scaleSuffix = options?.scale && options.scale > 1 ? `@${options.scale}x` : "";
  const colourwayPart = holdsArticleCover(doc) ? "" : `${safeColourway}_`;
  return `fnm-pattern_${safeFormat}_${colourwayPart}${safeSeed}${scaleSuffix}.${cleanExt}`;
}

// packages/core/src/share.ts
var LINK_VERSION = 2;
var DECK_LINK_VERSION = 3;
var MAX_FRAGMENT_LENGTH = 1e5;
var FORMAT_IDS = [
  "square",
  "portrait-4-5",
  "story-9-16",
  "screen-16-9",
  "a4-portrait",
  "a4-landscape",
  "link-1-91",
  "custom"
];
var DENSITIES = ["coarse", "medium", "fine", "extra-fine"];
var SLOPE_IDS = ["flat", "half", "75"];
var MODES = ["clear", "flat"];
var LAYOUT_IDS = ["pattern", "headline", "cover", "product-cover", "section-divider", "content", "closing", "article-cover"];
var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
function utf8Encode(text) {
  const out = [];
  for (const ch of text) {
    const c = ch.codePointAt(0);
    if (c < 128) out.push(c);
    else if (c < 2048) out.push(192 | c >> 6, 128 | c & 63);
    else if (c < 65536) out.push(224 | c >> 12, 128 | c >> 6 & 63, 128 | c & 63);
    else out.push(240 | c >> 18, 128 | c >> 12 & 63, 128 | c >> 6 & 63, 128 | c & 63);
  }
  return out;
}
function utf8Decode(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; ) {
    const b = bytes[i];
    const n = b < 128 ? 0 : b >= 194 && b < 224 ? 1 : b >= 224 && b < 240 ? 2 : b >= 240 && b < 245 ? 3 : -1;
    if (n < 0 || i + n >= bytes.length + (n === 0 ? 1 : 0)) return null;
    let c = n === 0 ? b : b & 63 >> n;
    for (let k = 1; k <= n; k++) {
      const cb = bytes[i + k];
      if ((cb & 192) !== 128) return null;
      c = c << 6 | cb & 63;
    }
    const min = [0, 128, 2048, 65536][n];
    if (c < min || c > 1114111 || c >= 55296 && c < 57344) return null;
    out += String.fromCodePoint(c);
    i += n + 1;
  }
  return out;
}
function b64urlEncode(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const n = bytes[i] << 16 | (bytes[i + 1] ?? 0) << 8 | (bytes[i + 2] ?? 0);
    out += B64[n >> 18 & 63] + B64[n >> 12 & 63];
    if (i + 1 < bytes.length) out += B64[n >> 6 & 63];
    if (i + 2 < bytes.length) out += B64[n & 63];
  }
  return out;
}
function b64urlDecode(text) {
  if (text.length % 4 === 1) return null;
  const bytes = [];
  let acc = 0;
  let bits = 0;
  for (const ch of text) {
    const v = B64.indexOf(ch);
    if (v < 0) return null;
    acc = acc << 6 | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push(acc >> bits & 255);
      acc &= (1 << bits) - 1;
    }
  }
  return acc === 0 ? bytes : null;
}
var zoneToArray = (z) => z ? [z.col, z.row, z.w, z.h, MODES.indexOf(z.mode)] : 0;
var blockToArray = (b, i) => {
  const a = [b.col, b.row, b.w, b.h, b.tint];
  if (b.id !== `block-${i + 1}`) a.push(b.id);
  return a;
};
function contentExtra(page) {
  const content = withoutPhoto(page.content);
  if (!content) return 0;
  const o = {};
  if (content.headline !== void 0) o.h = content.headline;
  if (content.secondary !== void 0) o.s = content.secondary;
  if (content.label !== void 0) o.l = content.label;
  if (content.ticker) o.t = [content.ticker.show ? 1 : 0, content.ticker.left, content.ticker.right];
  if (content.logo) o.g = content.logo.show ? 1 : 0;
  return o;
}
function pageExtra(page) {
  const c = contentExtra(page);
  if (!page.layout && c === 0) return 0;
  const extra = [LAYOUT_IDS.indexOf(page.layout ?? "pattern"), c];
  const settings = page.articleCover;
  if (settings?.highlight || settings?.photoEdge || settings?.fadeLength !== void 0 || settings?.fadeDirection) {
    const set = [HIGHLIGHT_COLOURS.indexOf(settings.highlight ?? "yellow")];
    if (settings.photoEdge || settings.fadeLength !== void 0 || settings.fadeDirection) {
      set.push(PHOTO_EDGES.indexOf(settings.photoEdge ?? DEFAULT_PHOTO_EDGE));
    }
    if (settings.fadeLength !== void 0 || settings.fadeDirection) set.push(settings.fadeLength ?? 0);
    if (settings.fadeDirection) set.push(FADE_DIRECTIONS.indexOf(settings.fadeDirection));
    extra.push(set);
  }
  return extra;
}
function deckExtra(doc, index) {
  const page = doc.pages[index];
  return [LAYOUT_IDS.indexOf(page.layout ?? "pattern"), contentExtra(page), pageSeed(doc, index), isPageEdited(doc, index) ? 1 : 0];
}
var SHARE_LINK_MAX_LENGTH = 8e3;
function encodeShareLinkDetailed(doc) {
  const refused = shareLinkProblem(doc);
  if (refused) return { link: "", photoDropped: false, tooLong: false, refused };
  const photoDropped = doc.pages.some((p) => p.content?.photo !== void 0);
  const payload = linkPayload(doc);
  const made = (link) => ({ link, photoDropped, tooLong: link.length > SHARE_LINK_MAX_LENGTH });
  const wrap2 = (extras2) => JSON.stringify(doc.transparentBackground ? [payload, extras2, 1] : [payload, extras2]);
  if (doc.pages.length > 1) {
    const extras2 = doc.pages.map((_, i) => deckExtra(doc, i));
    return made(`${DECK_LINK_VERSION}.${b64urlEncode(utf8Encode(wrap2(extras2)))}`);
  }
  const extras = doc.pages.map(pageExtra);
  if (extras.every((e) => e === 0) && !doc.transparentBackground) {
    return made(`1.${b64urlEncode(utf8Encode(JSON.stringify(payload)))}`);
  }
  return made(`${LINK_VERSION}.${b64urlEncode(utf8Encode(wrap2(extras)))}`);
}
function encodeShareLink(doc) {
  const { link, refused } = encodeShareLinkDetailed(doc);
  if (refused) throw new Error(refused);
  return link;
}
function linkPayload(doc) {
  const colourway = getColourway(doc.colourway);
  if (!colourway) throw new Error(`Unknown colourway: ${doc.colourway}`);
  const inputsOnly = !doc.edited && doc.pages.length === 1;
  const payload = [
    FORMAT_IDS.indexOf(doc.format),
    DENSITIES.indexOf(doc.density),
    colourway.index,
    SLOPE_IDS.indexOf(doc.generator.slope),
    doc.generator.blockCount,
    doc.generator.cornerMeetLimit,
    doc.blockCountExplicit === void 0 ? 0 : doc.blockCountExplicit ? 2 : 1,
    doc.seed,
    inputsOnly ? zoneToArray(doc.pages[0]?.textZone) : 0,
    doc.customSize ? [doc.customSize.widthPx, doc.customSize.heightPx] : 0
  ];
  if (!inputsOnly) {
    payload.push(
      doc.pages.map((p) => [zoneToArray(p.textZone), p.pattern.map(blockToArray)]),
      doc.edited ? 1 : 0
    );
  }
  const family = doc.generator.family ?? "auto";
  const set = doc.generator.referenceSet;
  const g = doc.generator.guidance;
  const f = PATTERN_FAMILIES.indexOf(family);
  const kept = formulaSettingsToLink(doc.generator);
  payload.push(kept ? [g, f, set ?? null, kept] : set !== void 0 ? [g, f, set] : family === "auto" ? g : [g, f]);
  return payload;
}
var invalid2 = (message) => ({ error: { code: "link.invalid", message } });
var isInt = (v) => typeof v === "number" && Number.isInteger(v);
var isArr = (v) => Array.isArray(v);
function zoneFromArray(v) {
  if (v === 0) return void 0;
  if (!isArr(v) || v.length !== 5 || !v.every(isInt)) return null;
  const mode = MODES[v[4]];
  return mode ? { col: v[0], row: v[1], w: v[2], h: v[3], mode } : null;
}
function pageExtraFromLink(v, deck = false) {
  if (v === 0) return {};
  if (!isArr(v) || !(deck ? v.length === 4 : v.length === 2 || v.length === 3) || !isInt(v[0])) return null;
  const layout = LAYOUT_IDS[v[0]];
  if (!layout) return null;
  const out = layout === "pattern" ? {} : { layout };
  if (v.length === 3) {
    const settings = v[2];
    if (layout !== "article-cover" || !isArr(settings) || settings.length < 1 || settings.length > 4 || !settings.every(isInt)) return null;
    const highlight = HIGHLIGHT_COLOURS[settings[0]];
    if (!highlight) return null;
    out.articleCover = { highlight };
    if (settings.length > 1) {
      const photoEdge = PHOTO_EDGES[settings[1]];
      if (!photoEdge) return null;
      out.articleCover.photoEdge = photoEdge;
    }
    if (settings.length > 2) {
      if (!(settings.length === 4 && settings[2] === 0)) {
        if (articleCoverProblem({ fadeLength: settings[2] })) return null;
        out.articleCover.fadeLength = settings[2];
      }
    }
    if (settings.length > 3) {
      const fadeDirection = FADE_DIRECTIONS[settings[3]];
      if (!fadeDirection) return null;
      out.articleCover.fadeDirection = fadeDirection;
    }
  }
  if (deck) {
    if (typeof v[2] !== "string" || !v[2] || v[3] !== 0 && v[3] !== 1) return null;
    out.seed = v[2];
    out.edited = v[3] === 1;
  }
  const c = v[1];
  if (c === 0) return out;
  if (typeof c !== "object" || c === null || isArr(c)) return null;
  const rec = c;
  const content = {};
  for (const [key, value] of Object.entries(rec)) {
    if (key === "h" || key === "s" || key === "l") {
      if (typeof value !== "string") return null;
      content[key === "h" ? "headline" : key === "s" ? "secondary" : "label"] = value;
    } else if (key === "t") {
      if (!isArr(value) || value.length !== 3 || value[0] !== 0 && value[0] !== 1) return null;
      if (typeof value[1] !== "string" || typeof value[2] !== "string") return null;
      content.ticker = { show: value[0] === 1, left: value[1], right: value[2] };
    } else if (key === "g") {
      if (value !== 0 && value !== 1) return null;
      content.logo = { show: value === 1 };
    } else {
      return null;
    }
  }
  return { ...out, content };
}
function decodeShareLink(fragment) {
  if (typeof fragment !== "string" || fragment.length > MAX_FRAGMENT_LENGTH) {
    return invalid2("Share link is not valid");
  }
  const m = /^(\d{1,6})\.([A-Za-z0-9_-]*)$/.exec(fragment);
  if (!m) return invalid2("Share link is not valid");
  const version = Number(m[1]);
  if (version !== 1 && version !== LINK_VERSION && version !== DECK_LINK_VERSION) {
    return {
      error: {
        code: "link.unsupportedVersion",
        message: `Share link version ${m[1]} is not supported (expected 1, ${LINK_VERSION} or ${DECK_LINK_VERSION})`
      }
    };
  }
  const bytes = b64urlDecode(m[2]);
  const text = bytes && utf8Decode(bytes);
  let p;
  try {
    p = text ? JSON.parse(text) : void 0;
  } catch {
    p = void 0;
  }
  let extras;
  let transparentBackground = false;
  if (version === LINK_VERSION || version === DECK_LINK_VERSION) {
    if (!isArr(p) || p.length !== 2 && p.length !== 3 || !isArr(p[1])) return invalid2("Share link is not valid");
    if (p.length === 3 && p[2] !== 1) return invalid2("Share link is not valid");
    transparentBackground = p.length === 3;
    extras = p[1];
    p = p[0];
  }
  if (!isArr(p) || ![10, 11, 12, 13].includes(p.length)) return invalid2("Share link is not valid");
  const hasGuidance = p.length === 11 || p.length === 13;
  const last = hasGuidance ? p[p.length - 1] : 0;
  const slot = isArr(last) && (last.length === 2 || last.length === 3 || last.length === 4);
  const guidance = slot ? last[0] : last;
  const familyIndex = slot ? last[1] : 0;
  const family = isInt(familyIndex) ? PATTERN_FAMILIES[familyIndex] : void 0;
  const referenceSet = slot && last.length >= 3 && last[2] !== null ? last[2] : void 0;
  if (!family || isArr(last) && !slot) return invalid2("Share link is not valid");
  if (slot && last.length === 3 && last[2] === null) return invalid2("Share link is not valid");
  const formulaParams = slot && last.length === 4 ? formulaSettingsFromLink(last[3]) : {};
  if (!formulaParams) return invalid2("Share link is not valid");
  const [fmt4, den, cw, slope, blockCount, cornerMeetLimit, explicit, seed, zone, custom] = p;
  const format = isInt(fmt4) ? FORMAT_IDS[fmt4] : void 0;
  const density = isInt(den) ? DENSITIES[den] : void 0;
  const slopeId = isInt(slope) ? SLOPE_IDS[slope] : void 0;
  const colourway = isInt(cw) ? colourwayForIndex(cw) : void 0;
  if (!format || !density || !slopeId || !colourway || typeof seed !== "string" || ![0, 1, 2].includes(explicit)) {
    return invalid2("Share link is not valid");
  }
  let customSize;
  if (custom !== 0) {
    if (!isArr(custom) || custom.length !== 2 || !custom.every(isInt)) return invalid2("Share link is not valid");
    customSize = { widthPx: custom[0], heightPx: custom[1] };
  }
  const inputsOnly = p.length <= 11;
  const rawPages = [];
  if (version === DECK_LINK_VERSION && inputsOnly) return invalid2("Share link is not valid");
  if (inputsOnly) {
    const textZone2 = zoneFromArray(zone);
    if (textZone2 === null) return invalid2("Share link is not valid");
    rawPages.push({ pattern: [], ...textZone2 ? { textZone: textZone2 } : {} });
  } else {
    const pages = p[10];
    if (!isArr(pages) || p[11] !== 0 && p[11] !== 1) return invalid2("Share link is not valid");
    for (const rp of pages) {
      if (!isArr(rp) || rp.length !== 2 || !isArr(rp[1])) return invalid2("Share link is not valid");
      const textZone2 = zoneFromArray(rp[0]);
      if (textZone2 === null) return invalid2("Share link is not valid");
      const pattern = [];
      for (let i = 0; i < rp[1].length; i++) {
        const b = rp[1][i];
        if (!isArr(b) || b.length !== 5 && b.length !== 6 || !b.slice(0, 5).every(isInt)) {
          return invalid2("Share link is not valid");
        }
        const id = b.length === 6 ? b[5] : `block-${i + 1}`;
        if (typeof id !== "string") return invalid2("Share link is not valid");
        const tint = isInt(cw) && LEGACY_COLOURWAY_IDS.has(cw) ? 0 : b[4];
        pattern.push({ id, col: b[0], row: b[1], w: b[2], h: b[3], tint });
      }
      rawPages.push({ pattern, ...textZone2 ? { textZone: textZone2 } : {} });
    }
  }
  if (extras) {
    if (extras.length !== rawPages.length) return invalid2("Share link is not valid");
    for (let i = 0; i < rawPages.length; i++) {
      const extra = pageExtraFromLink(extras[i], version === DECK_LINK_VERSION);
      if (extra === null) return invalid2("Share link is not valid");
      Object.assign(rawPages[i], extra);
    }
  }
  const raw = {
    version: 1,
    format,
    density,
    colourway: colourway.id,
    seed,
    generator: {
      slope: slopeId,
      blockCount,
      cornerMeetLimit,
      guidance,
      ...family === "auto" ? {} : { family },
      ...referenceSet === void 0 ? {} : { referenceSet },
      ...formulaParams
    },
    ...explicit === 0 ? {} : { blockCountExplicit: explicit === 2 },
    pages: rawPages,
    ...customSize ? { customSize } : {},
    edited: !inputsOnly && p[11] === 1,
    ...transparentBackground ? { transparentBackground: true } : {}
  };
  const validated = validateDocument(raw);
  if ("error" in validated) return invalid2(validated.error.message);
  const doc = validated.document;
  if (!inputsOnly) return { document: settlePages(doc) };
  const textZone = doc.pages[0]?.textZone;
  const { blocks } = generatePatternDetailed(
    gridFor(doc),
    colourway,
    createRng(doc.seed),
    doc.generator,
    { ...textZone ? { textZone } : {}, density: doc.density }
  );
  const page = { ...doc.pages[0], pattern: blocks };
  return { document: { ...doc, pages: [page] } };
}

// packages/core/src/gauges.ts
var ORIGIN_LABEL = {
  template: "Reference copy",
  skyline: "free path",
  flatCover: "flat-zone cover",
  fallback: "fallback",
  formula: "formula",
  freeShape: "free shape"
};
var pct = (share) => `${Math.round(share * 100)}%`;
var within = (value, range) => value >= range.min && value <= range.max;
function originOf2(origin) {
  if (origin.handEdited) return "edited by hand";
  if (origin.keeperCopy) return "Keeper copy";
  return origin.path ? ORIGIN_LABEL[origin.path] : "unknown";
}
function readGauges(doc, pageIndex) {
  const page = doc.pages[pageIndex];
  const blocks = page.pattern;
  const grid = gridFor(doc);
  const { slope, guidance, cornerMeetLimit, referenceSet } = doc.generator;
  const freeShape = doc.generator.freeShape !== void 0;
  const gauges = [];
  const drawn = drawOrigin(doc, pageIndex);
  const origin = originOf2(drawn);
  const keeperCopy = !drawn.handEdited && drawn.keeperCopy === true;
  gauges.push({
    id: "origin",
    label: "Made by",
    reading: origin,
    value: null,
    range: null,
    rangeText: null,
    state: "info",
    ...origin === "edited by hand" ? { detail: "No draw from this Page's seed gives its Blocks, so it was edited by hand.", handEdited: true } : {}
  });
  const rules = checkPatternRules(blocks, grid);
  const sim = patternSimilarity(blocks, grid, { slope, ...referenceSet !== void 0 ? { set: referenceSet } : {} });
  const asked = GUIDANCE_SIMILARITY_SHARE * guidance / 100;
  gauges.push({
    id: "nearest",
    label: "Nearest Reference Pattern",
    reading: sim.match ? `${sim.match.family} \xB7 ${sim.match.figmaNode} \xB7 ${sim.iou.toFixed(2)}` : "none",
    value: sim.match ? sim.iou : null,
    range: { min: asked, max: 1 },
    rangeText: `Guidance ${guidance}% asks for ${asked.toFixed(2)}`,
    state: "info"
  });
  const points = cellPoints(blocks, grid);
  const coverage = points.length / (grid.cols * grid.rows);
  const coverageRange = { min: PREFERRED_COVERAGE2[0], max: PREFERRED_COVERAGE2[1] };
  gauges.push({
    id: "coverage",
    label: "Coverage",
    reading: pct(coverage),
    value: coverage,
    range: coverageRange,
    rangeText: `${pct(coverageRange.min)} to ${pct(coverageRange.max)} preferred; the Pattern rules allow up to ${pct(COVERAGE_LIMIT[1])}`,
    // Red only where the Pattern rules enforce it: the ceiling, for two Blocks or more.
    state: rules.violations.some((v) => v.startsWith("coverage")) ? "out" : "ok"
  });
  const trend = cellTrend(blocks, grid);
  const [trendMin, trendMax] = SLOPE_TREND_BAND[slope];
  const trendRange = { min: trendMin, max: trendMax };
  const mountainHalf = doc.generator.family === "mountain" && slope !== "flat";
  const bandText = mountainHalf ? `${trendMin}\xB0 and up for a mountain` : slope === "flat" ? `below ${trendMax}\xB0 for Slope flat` : slope === "half" ? `${trendMin}\xB0 to ${trendMax}\xB0 for Slope half` : `${trendMin}\xB0 and up for Slope 75%`;
  const trendBroken = !keeperCopy && (!keepsGrowth(blocks, grid, slope) || slopeShapeProblem(blocks, grid, slope) === "shallow75");
  gauges.push({
    id: "trend",
    label: "Trend angle",
    reading: trend === null ? "none" : `${trend.toFixed(0)}\xB0`,
    value: trend,
    range: trendRange,
    rangeText: keeperCopy ? `${bandText}; a Keeper's copy is not held to it` : bandText,
    state: trendBroken ? "out" : trend === null ? "info" : "ok"
  });
  const meets = countCornerMeets(blocks).length;
  const meetRange = { min: 0, max: cornerMeetLimit };
  gauges.push({
    id: "cornerMeets",
    label: "Corner meets",
    reading: String(meets),
    value: meets,
    range: meetRange,
    rangeText: `at most ${cornerMeetLimit} (the Corner meet limit)`,
    state: within(meets, meetRange) ? "ok" : "out"
  });
  const countRange = blockCountRangeFor(grid);
  gauges.push({
    id: "blockCount",
    label: "Block count",
    reading: String(blocks.length),
    value: blocks.length,
    range: countRange,
    rangeText: freeShape ? `${countRange.min} to ${countRange.max} recommended for this Grid; Free shape is not held to it` : `${countRange.min} to ${countRange.max} recommended for this Grid`,
    state: freeShape ? "info" : within(blocks.length, countRange) ? "ok" : "out"
  });
  const smallest = blocks.reduce((m, b) => !m || b.w * b.h < m.w * m.h ? b : m, null);
  const signedArea = blockThresholdsFor(referenceSet, doc.density)?.minBlockArea;
  const smallestRange = signedArea === void 0 ? null : { min: signedArea, max: grid.cols * grid.rows };
  const smallestCells = smallest ? smallest.w * smallest.h : null;
  gauges.push({
    id: "smallestBlock",
    label: "Smallest Block",
    reading: smallest ? `${smallestCells} cells (${smallest.w}\xD7${smallest.h})` : "none",
    value: smallestCells,
    range: smallestRange,
    rangeText: smallestRange ? `at least ${smallestRange.min} cells` : "no range",
    state: smallestRange && smallestCells !== null ? within(smallestCells, smallestRange) ? "ok" : "out" : "info"
  });
  const failed = rules.violations.map((v) => v.split(":")[0]);
  gauges.push({
    id: "rules",
    label: "Pattern rules",
    reading: rules.ok ? "pass" : `fails: ${failed.join(", ")}`,
    value: null,
    range: null,
    rangeText: null,
    state: rules.ok ? "ok" : "out",
    ...rules.ok ? {} : { detail: rules.violations.join("; ") }
  });
  return gauges;
}

// packages/core/src/history.ts
var HISTORY_CAP = 200;
function createHistory(doc) {
  return {
    entries: [doc],
    index: 0
  };
}
function push(history, doc) {
  const nextEntries = history.entries.slice(0, history.index + 1);
  nextEntries.push(doc);
  if (nextEntries.length > HISTORY_CAP) {
    const trimmed = nextEntries.slice(nextEntries.length - HISTORY_CAP);
    return {
      entries: trimmed,
      index: trimmed.length - 1
    };
  }
  return {
    entries: nextEntries,
    index: nextEntries.length - 1
  };
}
function undo(history) {
  if (history.index <= 0) {
    return history;
  }
  return {
    entries: history.entries,
    index: history.index - 1
  };
}
function redo(history) {
  if (history.index >= history.entries.length - 1) {
    return history;
  }
  return {
    entries: history.entries,
    index: history.index + 1
  };
}
function current(history) {
  const doc = history.entries[history.index];
  if (!doc) {
    throw new Error("History is empty or invalid");
  }
  return doc;
}
function canUndo(history) {
  return history.index > 0;
}
function canRedo(history) {
  return history.index < history.entries.length - 1;
}

// packages/core/src/candidates.ts
var CANDIDATE_COUNT = 12;
var NEAR_DUPLICATE = 0.85;
var MAX_REROLLS = 20;
var LOOSER_GUIDANCE = [60, 30, 0];
var REROLLS_PER_STEP = 8;
function candidateFamilies(doc, setSeed) {
  const chosen = doc.generator.family ?? "auto";
  if (chosen !== "auto") return Array(CANDIDATE_COUNT).fill(chosen);
  const counts = doc.generator.slope === "75" ? [["rising", 7], ["hanging", 5]] : [["rising", 6], ["hanging", 4], ["mountain", 2]];
  const families = counts.flatMap(([family, n]) => Array(n).fill(family));
  const rng = createRng(`${setSeed}-families`);
  for (let i = families.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [families[i], families[j]] = [families[j], families[i]];
  }
  return families;
}
function candidateTries(doc, setSeed, index) {
  const seed = `${setSeed}-${index + 1}`;
  const own = doc.generator.guidance;
  const tries = [{ seed, guidance: own }];
  for (let k = 1; k <= MAX_REROLLS; k++) tries.push({ seed: `${seed}r${k}`, guidance: own });
  for (const guidance of LOOSER_GUIDANCE.filter((g) => g < own)) {
    for (let k = 0; k < REROLLS_PER_STEP; k++) tries.push({ seed: `${seed}g${guidance}r${k}`, guidance });
  }
  return tries;
}
function* candidateSet(doc, setSeed, options = {}) {
  const pageIndex = options.pageIndex ?? 0;
  const page = doc.pages[pageIndex];
  if (!page) throw new Error(`There is no Page at index ${pageIndex}.`);
  const grid = gridFor(doc);
  const colourway = getColourway(doc.colourway);
  const zone = page.textZone ? { textZone: page.textZone } : {};
  const families = candidateFamilies(doc, setSeed);
  const taken = [];
  for (let index = 0; index < CANDIDATE_COUNT; index++) {
    let best = null;
    let failure;
    for (const { seed, guidance } of candidateTries(doc, setSeed, index)) {
      if (best || failure) yield void 0;
      const params = { ...doc.generator, family: families[index], guidance, referenceSet: rollReferenceSet(doc.generator.referenceSet) };
      const { blocks, freeShapeFailure } = generatePatternDetailed(grid, colourway, createRng(seed), params, { ...zone, density: doc.density });
      if (freeShapeFailure) {
        failure = freeShapeFailure;
        continue;
      }
      const mask = patternMask(blocks, grid);
      const overlap = Math.max(0, ...taken.map((t) => maskOverlap(t, mask)));
      if (!best || overlap < best.overlap) best = { candidate: { seed, pattern: blocks }, mask, overlap };
      if (overlap < NEAR_DUPLICATE) break;
    }
    if (!best) {
      yield { index, rejected: freeShapeRejection(failure) };
      return;
    }
    taken.push(best.mask);
    yield { index, candidate: best.candidate };
  }
}
function generateCandidates(doc, setSeed, options = {}) {
  const set = [];
  for (const step of candidateSet(doc, setSeed, options)) if (step && "candidate" in step) set.push(step.candidate);
  return set;
}
function candidateSetKey(doc, setSeed, options = {}) {
  const page = doc.pages[options.pageIndex ?? 0];
  const { referenceSet: _set, ...generator } = doc.generator;
  return JSON.stringify([
    doc.format,
    doc.customSize ?? null,
    doc.density,
    doc.colourway,
    generator,
    doc.blockCountExplicit ?? false,
    page?.textZone ?? null,
    page?.layout ?? "pattern",
    setSeed
  ]);
}

// packages/core/src/keeper.ts
var NOVEL_BELOW = 0.9;
function keeperBlocker(format, density, hasTextZone) {
  if (format !== "square") return { reason: "format", message: "Only a Square Page can be saved as a Reference Pattern." };
  if (density !== "fine" && density !== "medium") {
    return { reason: "density", message: "Only a Pattern at Fine or Medium Density can be saved as a Reference Pattern." };
  }
  if (hasTextZone) return { reason: "textZone", message: "A Page with a Text zone cannot be saved as a Reference Pattern." };
  return null;
}
function keeperMask(blocks, grid) {
  const n = REFERENCE_SIZE;
  const scale = n / grid.cols;
  const cells = Array.from({ length: n }, () => Array(n).fill("."));
  for (const b of blocks) {
    for (let r2 = Math.max(0, b.row * scale); r2 < Math.min(n, (b.row + b.h) * scale); r2++) {
      for (let c = Math.max(0, b.col * scale); c < Math.min(n, (b.col + b.w) * scale); c++) cells[r2][c] = "#";
    }
  }
  return cells.map((row) => row.join(""));
}
function maskFamily(mask) {
  const left = mask.some((r2) => r2[0] === "#");
  const top = mask[0].includes("#");
  const bottom = mask[mask.length - 1].includes("#");
  if (!left) return "mountain";
  if (bottom) return "rising";
  if (top) return "hanging";
  return null;
}
function maskIou(a, b) {
  let inter = 0;
  let union = 0;
  for (let r2 = 0; r2 < a.length; r2++) {
    for (let c = 0; c < a[r2].length; c++) {
      const x = a[r2][c] === "#";
      const y = b[r2][c] === "#";
      if (x && y) inter++;
      if (x || y) union++;
    }
  }
  return union === 0 ? 0 : inter / union;
}
function keeperSlopesFor(family) {
  return family === "mountain" ? ["flat", "half"] : ["flat", "half", "75"];
}
function nearestOf(mask, known, kind) {
  let best = null;
  for (const k of known) {
    const iou = maskIou(mask, k.mask);
    if (!best || iou > best.iou) best = { id: k.id, kind, iou };
  }
  return best;
}
var pct2 = (x) => `${Math.round(x * 100)}%`;
function checkKeeper(input) {
  const blocker = keeperBlocker(input.format, input.density, input.hasTextZone);
  if (blocker) return { ok: false, ...blocker };
  const rules = checkPatternRules(input.blocks, input.grid);
  if (!rules.ok) return { ok: false, reason: "patternRules", message: `The Pattern rules fail: ${rules.violations.join("; ")}.` };
  const mask = keeperMask(input.blocks, input.grid);
  const covered = mask.join("").split("#").length - 1;
  if (covered < COVERAGE_LIMIT[0] * REFERENCE_SIZE * REFERENCE_SIZE) {
    return {
      ok: false,
      reason: "coverage",
      message: `The Pattern covers ${pct2(covered / (REFERENCE_SIZE * REFERENCE_SIZE))} of the Page, under the lower limit of ${pct2(COVERAGE_LIMIT[0])}.`
    };
  }
  const family = input.choice?.family ?? maskFamily(mask);
  if (!family) return { ok: false, reason: "noFamily", message: "The Pattern touches no edge that makes it a rising, hanging or mountain Pattern." };
  const slope = input.choice?.slope ?? classifyReferenceSlope(mask, family);
  if (!slope) return { ok: false, reason: "noSlope", message: "The Pattern fits no Slope." };
  const slopes = keeperSlopesFor(family);
  if (!slopes.includes(slope)) {
    return { ok: false, reason: "slopeNotOffered", message: `A ${family} Pattern cannot serve the ${slope === "75" ? "75%" : slope} Slope.` };
  }
  const reference = nearestOf(mask, input.references, "reference");
  const keeper = nearestOf(mask, input.keepers, "keeper");
  const nearest2 = reference && keeper ? keeper.iou > reference.iou ? keeper : reference : reference ?? keeper;
  if (reference && reference.iou >= NOVEL_BELOW) {
    return { ok: false, reason: "nearReference", message: `Too close to the Reference Pattern ${reference.id} (${pct2(reference.iou)}; the bar is under ${pct2(NOVEL_BELOW)}).`, nearest: reference };
  }
  if (keeper && keeper.iou >= NOVEL_BELOW) {
    return { ok: false, reason: "nearKeeper", message: `Too close to the Keeper ${keeper.id} (${pct2(keeper.iou)}; the bar is under ${pct2(NOVEL_BELOW)}).`, nearest: keeper };
  }
  return { ok: true, mask, slope, family, slopes, nearest: nearest2 };
}
function keeperId(mask, taken = /* @__PURE__ */ new Set()) {
  let h = 2166136261;
  for (const ch of mask.join("")) {
    h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  }
  const id = `k-${h.toString(16).padStart(8, "0")}`;
  if (!taken.has(id)) return id;
  let n = 2;
  while (taken.has(`${id}-${n}`)) n++;
  return `${id}-${n}`;
}

// packages/core/src/preset.ts
var PRESET_REFERENCE_SET = 3;
var RISK_LEVELS = ["low", "medium", "high"];
var RISK_SLOPES = ["flat", "half", "75"];
function slopeFor({ investmentStyle, risk }) {
  const [from, to] = (typeof risk === "string" ? [risk, risk] : risk).map((level) => RISK_LEVELS.indexOf(level));
  const slope = RISK_SLOPES[Math.ceil((from + to) / 2)];
  return investmentStyle === "market-timing" && slope === "75" ? "half" : slope;
}
var STYLE_SHAPES = {
  "one-time": { families: ["rising", "hanging"], cornerMeetLimit: 0 },
  "dollar-cost-average": { families: ["rising", "hanging"], cornerMeetLimit: 2 },
  "market-timing": { families: ["mountain"], cornerMeetLimit: 1 }
};
var BLOCK_COUNTS = {
  2: [1, 2, 3],
  4: [2, 3, 4, 5, 6],
  8: [2, 3, 4, 6, 8, 12],
  16: [3, 5, 8, 12, 16, 24, 32]
};
var GUIDANCES = [0, 60];
var SEEDS = Array.from({ length: 60 }, (_, n) => `preset-${n}`);
var INITIAL_COST_STEPS = [1, 5e3, 2e4, 5e4, 5e5, 2e6, 1e7];
var NARROW = {
  2: { w: 1, h: [1, 1, 2, 2] },
  4: { w: 1, h: [1, 2, 2, 3] },
  8: { w: 1, h: [2, 3, 4, 5] },
  16: { w: 2, h: [4, 6, 8, 10] }
};
var WIDE = { 2: 2, 4: 2, 8: 2, 16: 4 };
function distanceFromTarget(side, step, { w, h }) {
  if (step <= 3) return Math.abs(w - NARROW[side].w) + Math.abs(h - NARROW[side].h[step]);
  if (side === 2) return Math.abs(w - 2) + Math.abs(h - 1);
  return Math.max(0, WIDE[side] - w) + Math.max(0, WIDE[side] - h);
}
function joinedByEdges(filled, side) {
  const reached = /* @__PURE__ */ new Set();
  const queue = [filled.indexOf(true)];
  while (queue.length > 0) {
    const cell = queue.pop();
    if (reached.has(cell)) continue;
    reached.add(cell);
    const col = cell % side;
    for (const next of [cell - side, cell + side, col > 0 ? cell - 1 : -1, col < side - 1 ? cell + 1 : -1]) {
      if (filled[next]) queue.push(next);
    }
  }
  return reached.size === filled.filter(Boolean).length;
}
function search(side, family, slope, cornerMeetLimit) {
  const grid = { cols: side, rows: side, cellW: 1, cellH: 1 };
  const colourway = getColourway(DEFAULT_COLOURWAY_ID);
  const found = /* @__PURE__ */ new Map();
  for (const blockCount of BLOCK_COUNTS[side])
    for (const guidance of GUIDANCES)
      for (const seed of SEEDS) {
        const settings = { family, slope, blockCount, guidance, cornerMeetLimit };
        const blocks = generatePattern(grid, colourway, createRng(seed), { ...settings, referenceSet: PRESET_REFERENCE_SET });
        if (blocks.length === 0) continue;
        const filled = Array(side * side).fill(false);
        for (const b of blocks)
          for (let row = b.row; row < b.row + b.h; row++)
            for (let col = b.col; col < b.col + b.w; col++) filled[row * side + col] = true;
        const cells = filled.map((on) => on ? "#" : ".").join("");
        const largest = blocks.reduce((a, b) => b.w * b.h > a.w * a.h ? b : a);
        const key = `${cells}|${largest.w}x${largest.h}`;
        if (found.has(key)) continue;
        found.set(key, {
          settings: { ...settings, seed },
          cells,
          largestBlock: { w: largest.w, h: largest.h },
          edgeJoined: joinedByEdges(filled, side),
          sample: patternMask(blocks, grid)
        });
      }
  return [...found.values()];
}
function presetBricks(side, entries) {
  const searched = /* @__PURE__ */ new Map();
  const searchOnce = (family, slope, cornerMeetLimit) => {
    const key = [family, slope, cornerMeetLimit].join();
    if (!searched.has(key)) searched.set(key, search(side, family, slope, cornerMeetLimit));
    return searched.get(key);
  };
  for (const { id, strategy, planCover } of entries) {
    if (!INITIAL_COST_STEPS.includes(strategy.initialCost)) {
      throw new Error(`Preset entry "${id}": Initial Cost ${strategy.initialCost} is not one of the steps ${INITIAL_COST_STEPS.join(", ")}.`);
    }
    if (planCover && (planCover.length !== REFERENCE_SIZE || planCover.some((row) => row.length !== REFERENCE_SIZE))) {
      throw new Error(`Preset entry "${id}": a Plan Cover is ${REFERENCE_SIZE} rows of ${REFERENCE_SIZE} cells.`);
    }
  }
  const taken = /* @__PURE__ */ new Set();
  return entries.map(({ id, strategy, planCover }) => {
    const style = strategy.investmentStyle;
    const { families, cornerMeetLimit } = STYLE_SHAPES[style];
    const slope = slopeFor(strategy);
    const allowed = families.flatMap((family) => searchOnce(family, slope, cornerMeetLimit)).filter((brick) => style === "market-timing" || brick.edgeJoined === (style === "one-time"));
    const step = INITIAL_COST_STEPS.indexOf(strategy.initialCost);
    const cover = planCover?.flat();
    let best = null;
    for (const brick of allowed) {
      const distance = distanceFromTarget(side, step, brick.largestBlock);
      const fresh = !taken.has(brick.cells);
      const overlap = cover ? maskOverlap(brick.sample, cover) : 0;
      const better = !best || distance < best.distance || distance === best.distance && (fresh !== best.fresh ? fresh : overlap > best.overlap);
      if (better) best = { brick, distance, fresh, overlap };
    }
    if (!best) return null;
    taken.add(best.brick.cells);
    return { id, ...best.brick.settings, largestBlock: best.brick.largestBlock, exact: best.distance === 0 };
  });
}

// scripts/svg-raster.ts
import { crc32, deflateSync } from "node:zlib";

// stub:fast-png
var refuse = () => {
  throw new Error("block-engine.mjs does not draw photos: fast-png is not bundled.");
};
var decode = refuse;

// stub:jpeg-js
var refuse2 = () => {
  throw new Error("block-engine.mjs does not draw photos: jpeg-js is not bundled.");
};
var jpeg_js_default = { decode: refuse2, encode: refuse2 };

// scripts/svg-raster.ts
var SS = 4;
var attrsOf = (tag) => {
  const out = {};
  for (const m of tag.matchAll(/([\w:-]+)="([^"]*)"/g)) out[m[1]] = m[2];
  return out;
};
var num = (a, k, fallback = 0) => a[k] === void 0 ? fallback : Number(a[k]);
var unescapeAttr = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
var hexRgb2 = (hex) => {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) throw new Error(`svg-raster: only #rrggbb fills are drawn, not "${hex}".`);
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
};
function blend(r2, i, [cr, cg, cb], a) {
  if (a <= 0) return;
  const d = r2.data;
  const o = i * 4;
  const ad = d[o + 3] / 255;
  const ao = a + ad * (1 - a);
  d[o] = Math.round((cr * a + d[o] * ad * (1 - a)) / ao);
  d[o + 1] = Math.round((cg * a + d[o + 1] * ad * (1 - a)) / ao);
  d[o + 2] = Math.round((cb * a + d[o + 2] * ad * (1 - a)) / ao);
  d[o + 3] = Math.round(ao * 255);
}
function fillRect(r2, x, y, w, h, rgb, crisp) {
  if (crisp) {
    const x0 = Math.max(0, Math.round(x));
    const x1 = Math.min(r2.width, Math.round(x + w));
    const y0 = Math.max(0, Math.round(y));
    const y1 = Math.min(r2.height, Math.round(y + h));
    for (let py = y0; py < y1; py++) for (let px = x0; px < x1; px++) blend(r2, py * r2.width + px, rgb, 1);
    return;
  }
  for (let py = Math.max(0, Math.floor(y)); py < Math.min(r2.height, Math.ceil(y + h)); py++) {
    const cy = Math.min(py + 1, y + h) - Math.max(py, y);
    for (let px = Math.max(0, Math.floor(x)); px < Math.min(r2.width, Math.ceil(x + w)); px++) {
      blend(r2, py * r2.width + px, rgb, (Math.min(px + 1, x + w) - Math.max(px, x)) * cy);
    }
  }
}
function flatten(d, sx, sy) {
  const polys = [];
  let cur = [];
  let at = [0, 0];
  for (const cmd of parsePath(d)) {
    if (cmd.c === "M") {
      cur = [[cmd.v[0] * sx, cmd.v[1] * sy]];
      polys.push(cur);
      at = cur[0];
    } else if (cmd.c === "L") {
      at = [cmd.v[0] * sx, cmd.v[1] * sy];
      cur.push(at);
    } else if (cmd.c === "C") {
      const [x1, y1, x2, y2, x3, y3] = cmd.v.map((n, i) => n * (i % 2 === 0 ? sx : sy));
      for (let i = 1; i <= 16; i++) {
        const t = i / 16;
        const u = 1 - t;
        cur.push([
          u * u * u * at[0] + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
          u * u * u * at[1] + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3
        ]);
      }
      at = [x3, y3];
    }
  }
  return polys;
}
function fillPolys(r2, polys, rgb) {
  const pts = polys.flat();
  if (pts.length === 0) return;
  const minY = Math.max(0, Math.floor(Math.min(...pts.map((p) => p[1]))));
  const maxY = Math.min(r2.height, Math.ceil(Math.max(...pts.map((p) => p[1]))));
  const hits = new Float32Array(r2.width * (maxY - minY));
  for (let sy = minY * SS; sy < maxY * SS; sy++) {
    const y = (sy + 0.5) / SS;
    const xs = [];
    for (const poly of polys) {
      for (let i = 0; i < poly.length; i++) {
        const [x0, y0] = poly[i];
        const [x1, y1] = poly[(i + 1) % poly.length];
        if (y0 <= y && y1 > y || y1 <= y && y0 > y) xs.push([x0 + (y - y0) / (y1 - y0) * (x1 - x0), y1 > y0 ? 1 : -1]);
      }
    }
    xs.sort((p, q) => p[0] - q[0]);
    let winding = 0;
    for (let i = 0; i < xs.length - 1; i++) {
      winding += xs[i][1];
      if (winding === 0) continue;
      const from = Math.max(0, Math.ceil(xs[i][0] * SS - 0.5));
      const to = Math.min(r2.width * SS, Math.ceil(xs[i + 1][0] * SS - 0.5));
      for (let sx = from; sx < to; sx++) hits[(Math.floor(sy / SS) - minY) * r2.width + Math.floor(sx / SS)] += 1;
    }
  }
  for (let i = 0; i < hits.length; i++) {
    if (hits[i] > 0) blend(r2, minY * r2.width + i, rgb, Math.min(hits[i], SS * SS) / (SS * SS));
  }
}
function decodeDataUrl(href) {
  const m = /^data:image\/(png|jpe?g);base64,(.*)$/s.exec(href);
  if (!m) throw new Error("svg-raster: a photo must be a base64 PNG or JPEG data URL.");
  const bytes = Buffer.from(m[2], "base64");
  if (m[1] === "png") {
    const png = decode(bytes);
    if (png.depth !== 8 || png.palette) throw new Error("svg-raster: only 8-bit PNG photos without a palette are decoded.");
    const { width, height, channels } = png;
    const data = new Uint8Array(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      const s = i * channels;
      const grey = channels < 3;
      data.set([png.data[s], grey ? png.data[s] : png.data[s + 1], grey ? png.data[s] : png.data[s + 2], channels === 2 ? png.data[s + 1] : channels === 4 ? png.data[s + 3] : 255], i * 4);
    }
    return { width, height, data };
  }
  const jpg = jpeg_js_default.decode(bytes, { useTArray: true, formatAsRGBA: true });
  return { width: jpg.width, height: jpg.height, data: jpg.data };
}
var paintImage = (image, width, height) => {
  const src = decodeDataUrl(image.href);
  const k = Math.max(width / src.width, height / src.height);
  const left = (src.width * k - width) / 2;
  const top = (src.height * k - height) / 2;
  const data = new Uint8Array(width * height * 4);
  const at = (x, y, c) => src.data[(Math.min(src.height - 1, Math.max(0, y)) * src.width + Math.min(src.width - 1, Math.max(0, x))) * 4 + c];
  for (let y = 0; y < height; y++) {
    const fy = (y + 0.5 + top) / k - 0.5;
    const y0 = Math.floor(fy);
    const ty = fy - y0;
    for (let x = 0; x < width; x++) {
      const fx = (x + 0.5 + left) / k - 0.5;
      const x0 = Math.floor(fx);
      const tx = fx - x0;
      for (let c = 0; c < 4; c++) {
        const top2 = at(x0, y0, c) * (1 - tx) + at(x0 + 1, y0, c) * tx;
        const bottom = at(x0, y0 + 1, c) * (1 - tx) + at(x0 + 1, y0 + 1, c) * tx;
        data[(y * width + x) * 4 + c] = Math.round(top2 * (1 - ty) + bottom * ty);
      }
    }
  }
  return { width, height, data };
};
function rasterizeSvg(svg, options = {}) {
  const scale = options.scale ?? 1;
  const paintPhoto = options.image ?? paintImage;
  const root = attrsOf(/<svg\b[^>]*>/.exec(svg)?.[0] ?? "");
  const box = (root.viewBox ?? `0 0 ${root.width} ${root.height}`).split(/\s+/).map(Number);
  const [vbW, vbH] = [box[2], box[3]];
  const width = Math.round(num(root, "width", vbW) * scale);
  const height = Math.round(num(root, "height", vbH) * scale);
  if (!(width > 0 && height > 0)) throw new Error("svg-raster: the SVG has no size.");
  const sx = width / vbW;
  const sy = height / vbH;
  const raster = { width, height, data: new Uint8Array(width * height * 4) };
  const crisp = [];
  let clipDepth = 0;
  for (const m of svg.matchAll(/<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g)) {
    const [, closing, name, rest, selfClosing] = m;
    if (name === "g") {
      if (closing) crisp.pop();
      else {
        const a2 = attrsOf(rest);
        if (Object.keys(a2).some((k) => k !== "shape-rendering")) throw new Error("svg-raster: a <g> carries only shape-rendering.");
        if (!selfClosing) crisp.push(crisp.at(-1) === true || a2["shape-rendering"] === "crispEdges");
      }
      continue;
    }
    if (name === "clipPath") {
      clipDepth += closing ? -1 : 1;
      continue;
    }
    if (closing || name === "svg" || clipDepth > 0) continue;
    const a = attrsOf(rest);
    if ("opacity" in a || "transform" in a || "stroke" in a || "fill-opacity" in a) {
      throw new Error(`svg-raster: <${name}> uses an attribute this rasteriser does not draw.`);
    }
    if (name === "rect") {
      fillRect(raster, num(a, "x") * sx, num(a, "y") * sy, num(a, "width") * sx, num(a, "height") * sy, hexRgb2(a.fill ?? ""), crisp.at(-1) === true);
    } else if (name === "path") {
      fillPolys(raster, flatten(a.d ?? "", sx, sy), hexRgb2(a.fill ?? ""));
    } else if (name === "image") {
      const x0 = Math.round(num(a, "x") * sx);
      const y0 = Math.round(num(a, "y") * sy);
      const w = Math.round((num(a, "x") + num(a, "width")) * sx) - x0;
      const h = Math.round((num(a, "y") + num(a, "height")) * sy) - y0;
      const slot = paintPhoto({ href: unescapeAttr(a.href ?? ""), x: num(a, "x"), y: num(a, "y"), w: num(a, "width"), h: num(a, "height") }, w, h);
      for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
          const ox = x0 + px;
          const oy = y0 + py;
          if (ox < 0 || oy < 0 || ox >= width || oy >= height) continue;
          const o = (py * w + px) * 4;
          blend(raster, oy * width + ox, [slot.data[o], slot.data[o + 1], slot.data[o + 2]], slot.data[o + 3] / 255);
        }
      }
    } else {
      throw new Error(`svg-raster: <${name}> is not drawn.`);
    }
  }
  return raster;
}
function encodePng({ width, height, data }) {
  const chunk = (type, body) => {
    const typed = Buffer.concat([Buffer.from(type, "latin1"), body]);
    const len = Buffer.alloc(4);
    len.writeUInt32BE(body.length);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typed));
    return Buffer.concat([len, typed, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.set([8, 6, 0, 0, 0], 8);
  const rows = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    rows[y * (width * 4 + 1)] = 0;
    rows.set(data.subarray(y * width * 4, (y + 1) * width * 4), y * (width * 4 + 1) + 1);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(rows)),
    chunk("IEND", Buffer.alloc(0))
  ]);
}
export {
  AREA_RESAMPLE_SET,
  BASE_BLOCK_SIZES,
  BRAND_COLOURS,
  BRAND_COLOUR_TABLE,
  CANDIDATE_COUNT,
  CLEAR_ZONE_MAX_OVERLAP,
  CLEAR_ZONE_RING_DEPTH,
  COLOURWAYS,
  COLOURWAYS_LIST,
  CONTENT_SECONDARY_MAX_OF_SHORT,
  COVERAGE_LIMIT,
  CURRENT_APP_NAME,
  CURRENT_SCHEMA_VERSION,
  DEFAULT_COLOURWAY_ID,
  DEFAULT_FADE_DIRECTION,
  DEFAULT_FADE_LENGTH,
  DEFAULT_GUIDANCE,
  DEFAULT_PHOTO_EDGE,
  DEFAULT_VARIATION,
  DENSITY_TABLES,
  FACE_FILES,
  FACE_IDS,
  FADE_DIRECTIONS,
  FADE_LENGTH_RANGE,
  FORMATS,
  FREE_SHAPE_DEFAULT,
  FREE_SHAPE_SETTINGS,
  HEADLINE_MAX_OF_SHORT,
  HIGHLIGHT_COLOURS,
  HIGHLIGHT_PAD_X,
  HIGHLIGHT_PAD_Y,
  HISTORY_CAP,
  INITIAL_COST_STEPS,
  LABEL_MAX_OF_SHORT,
  LATEST_REFERENCE_SET,
  LAYOUT_TABLE,
  LOGO_ASPECT,
  LOGO_I_HEIGHT,
  LOGO_MARGIN_OF_SHORT_SIDE,
  LOGO_MIN_HEIGHT_PX,
  LOGO_PATH_DATA,
  LOGO_VIEWBOX,
  LOGO_WIDTH_OF_SHORT_SIDE,
  MAX_BLOCK_COUNT,
  MAX_CONTENT_TEXT,
  MAX_HIGHLIGHT_WORDS,
  MAX_RECOMMENDED_CORNER_MEETS,
  MIN_CAPS_LETTERS,
  NEAR_DUPLICATE,
  NOVEL_BELOW,
  PATTERN_FAMILIES,
  PHOTO_EDGES,
  PLEX_FACE_FILES,
  PREFERRED_COVERAGE2 as PREFERRED_COVERAGE,
  PRESET_REFERENCE_SET,
  PRIMARY_NAVY_YELLOW,
  PhotoBakeError,
  RECOMMENDED_MAX_FACTOR,
  REFERENCE_PATTERNS,
  REFERENCE_SIZE,
  SECONDARY_MAX_OF_SHORT,
  SECONDARY_OF_HEADLINE,
  SHAPE_SETTINGS,
  SHAPE_SETTING_RANGES,
  SHARE_LINK_MAX_LENGTH,
  SLOPES2 as SLOPES,
  SLOPE_TREND_BAND,
  SQUARE_FORMAT,
  TEXT_NAVY,
  TEXT_WHITE,
  TICKER_HEIGHT_OF_CAP,
  TICKER_MAX_OF_SHORT,
  TYPE_STYLES,
  UNRELEASED_REFERENCE_SET,
  WICK_LENGTH,
  WICK_WIDTH,
  articleCoverEdge,
  articleCoverPatternArea,
  articleCoverSettings,
  bakeFade,
  bakeRequestOf,
  blockCountRangeFor,
  blockRuleProblem,
  blockRulesFor,
  blockSettingRangesFor,
  blockThresholdsFor,
  breakUnits,
  bringBlockSettingsInside,
  canRedo,
  canUndo,
  candidateFamilies,
  candidateSet,
  candidateSetKey,
  cellPoints,
  cellTrend,
  cellsCovering,
  checkKeeper,
  checkPatternRules,
  classifyReferenceSlope,
  colourPhotoProblem,
  colourwayForIndex,
  composeScene,
  computeWarnings,
  contentAllowedOn,
  contours,
  countCornerMeets,
  countHighlightWords,
  countHighlightedWords,
  createHistory,
  createRng,
  createShaper,
  current,
  decodeShareLink,
  defaultBlockCountFor,
  defaultFadeLength,
  defaultFreeShapeColumns,
  defaultGeneratorParams,
  densityLevelsFor,
  deserialize,
  encodePng,
  encodeShareLink,
  encodeShareLinkDetailed,
  execute,
  exportFileName,
  fadeDirectionOf,
  fadeLengthMax,
  fadeRampCells,
  fillUnderSlot,
  fitText,
  formatDensityLabel,
  formulaFamilyFor,
  freeShapeBlockProblem,
  freeShapeBlockRanges,
  freeShapeFrom,
  freedomFor,
  generateCandidates,
  generatePattern,
  generatePatternDetailed,
  generateRandomSeed,
  generatorBlockSizesFor,
  getColourway,
  getFormatDimensions,
  gridFor,
  hashString,
  highlightGeometry,
  highlightHex,
  holdsArticleCover,
  isAllCapsHeadline,
  isHandEdited,
  isPageEdited,
  isTemplateModeCertain,
  isValidBlockSize,
  itemizeScripts,
  keeperBlocker,
  keeperId,
  keeperIsOnBrand,
  keeperMask,
  keeperSlopesFor,
  layoutOutline,
  layoutPrepared,
  layoutSlots,
  layoutSlotsFor,
  layoutText,
  layoutTextZone,
  listColourways,
  listFormats,
  loadHarfBuzz,
  logoBox,
  logoPlacement,
  maskFamily,
  maskIou,
  maskOverlap,
  measureClearZoneOverlap,
  measureShape,
  measureShapeRanges,
  measureTittle,
  measuredReferencePatterns,
  migrateColourwayId,
  mulberry32,
  nextPageSeed,
  orientationFor,
  pageFills,
  pageSeed,
  parseMarkup,
  parsePath,
  pathBounds,
  patternMask,
  patternMasses,
  patternSimilarity,
  photoBakeCrop,
  photoBakeKey,
  photoBakeRequest,
  photoProblem,
  pickLongSideCount,
  prepareText,
  presetBricks,
  push,
  rasterizeSvg,
  readGauges,
  recommendedMaxBlockCountFor,
  redo,
  referencePatternsFor,
  renderSvg,
  repairPatternRules,
  sceneToSvg,
  serialize,
  set4RuleProblem,
  shapeRangeFor,
  shapeSettingsMoveNothing,
  shareLinkProblem,
  slopeShapeProblem,
  staircaseSteps,
  stepEdgeCuts,
  templateMask,
  textColourFor,
  tintFill,
  toReferencePattern,
  transformPath,
  trendDegrees,
  undo,
  uniformFillUnder,
  usesSet4Rules,
  validateDocument,
  validateFormulaParams,
  validateFreeShape,
  validateGeneratorParams,
  withReferencePatterns,
  withoutFreeShape,
  withoutPhoto
};
