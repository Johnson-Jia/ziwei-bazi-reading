/**
 * _empower.js —— 积极赋能语料层查询模块。
 * 读取 data/empower.json,提供 lookup(category,key);查不到用 genericTransform 兜底。
 * 供 gen_*.js(INTERP/格局卡/积极引导专区)与 LLM prompt 共用。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const EMPOWER_PATH = path.join(__dirname, '..', 'data', 'empower.json');

let _cache = null;
function loadEmpower() {
  if (!_cache) _cache = JSON.parse(fs.readFileSync(EMPOWER_PATH, 'utf8'));
  return _cache;
}

/** 通用转化模板(兜底:empower.json 未收录的象) */
function genericTransform(label) {
  return {
    judgment: label,
    transform: '此为人生功课,宜顺势修行、扬长避短',
    action: ['保持积极心态', '扬长避短', '顺势而为'],
    mindset: '课题即成长,转化即智慧',
  };
}

/** 查询:返回 {judgment,transform,action[],mindset};查不到走兜底 */
function lookup(category, key) {
  const lib = loadEmpower();
  const entry = lib[category] && lib[category][key];
  return entry || genericTransform(key);
}

module.exports = { loadEmpower, lookup, genericTransform };
