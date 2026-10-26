// Bundlers replace `process.env.NODE_ENV` in the consumer's build (as they do
// for React itself). Only this field is declared on purpose: @types/node is
// not loaded for src/, so Node-only APIs can't slip into browser code.
declare const process: { env: { NODE_ENV?: string } };
