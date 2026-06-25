/**
 * workspace 工作目录解析 —— 统一管理技能产出(命书HTML/解读JSON)，避免散落与误入git。
 *
 * 路径优先级(高→低):
 *   1. 环境变量 ZIWEI_WORKSPACE
 *   2. 项目级 <技能根>/.ziwei-workspace   (纯文本, 一行路径)
 *   3. 用户级 <homedir>/.ziwei-workspace  (纯文本, 一行路径)
 *   4. 默认    <技能根>/workspace
 * 相对路径相对【技能根】解析; 返回绝对路径; ensureWorkspace() 自动创建目录。
 *
 * 用法: const { ensureWorkspace } = require('./_workspace'); const WS = ensureWorkspace();
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

/** 技能根 = 本文件(scripts/)的上一级(SKILL.md 所在目录) */
const projectRoot = () => path.resolve(__dirname, '..');

/** 相对路径相对技能根解析为绝对路径 */
const toAbs = (p) => path.isAbsolute(p) ? path.normalize(p) : path.resolve(projectRoot(), p);

function resolveWorkspace() {
  // 1. 环境变量(最高, 临时覆盖)
  if (process.env.ZIWEI_WORKSPACE) return toAbs(process.env.ZIWEI_WORKSPACE.trim());
  // 2. 项目级 <技能根>/.ziwei-workspace
  const projCfg = path.join(projectRoot(), '.ziwei-workspace');
  if (fs.existsSync(projCfg)) {
    const v = fs.readFileSync(projCfg, 'utf8').trim();
    if (v) return toAbs(v);
  }
  // 3. 用户级 ~/.ziwei-workspace
  const userCfg = path.join(os.homedir(), '.ziwei-workspace');
  if (fs.existsSync(userCfg)) {
    const v = fs.readFileSync(userCfg, 'utf8').trim();
    if (v) return toAbs(v);
  }
  // 4. 默认 <技能根>/workspace
  return path.join(projectRoot(), 'workspace');
}

/** 解析 workspace 并确保目录存在, 返回绝对路径 */
function ensureWorkspace() {
  const ws = resolveWorkspace();
  if (!fs.existsSync(ws)) fs.mkdirSync(ws, { recursive: true });
  return ws;
}

module.exports = { projectRoot, resolveWorkspace, ensureWorkspace, toAbs };
