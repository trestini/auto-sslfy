import os from "os";
import path from "path";
export const PKG_NAME = "auto-sslfy";
export const SSLFY_DATA_DIR = path.join(os.homedir(), `.${PKG_NAME}`);
