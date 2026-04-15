#!/usr/bin/env python3
"""
Claude 上下文使用监控脚本
用于获取当前会话的上下文使用百分比
"""
import os
import sys
import json
import time
from pathlib import Path

# 缓存文件路径
CACHE_FILE = Path.home() / ".claude" / "context_cache.json"

def get_context_from_api():
    """
    尝试从 Claude API 或环境获取上下文信息
    由于 Claude Code 没有直接暴露此信息，我们使用估算方法
    """
    # 获取当前对话历史的大致 token 数（估算）
    # 实际使用时需要 Claude API 密钥

    # 检查是否有 Claude API 密钥
    api_key = os.environ.get("ANTHROPIC_API_KEY")

    if not api_key:
        # 没有 API 密钥，返回估算值或问号
        return None, "API key not found"

    try:
        # 这里可以调用 Claude API 获取实际使用情况
        # 简化起见，返回 None 表示无法获取
        return None, "API call not implemented"
    except Exception as e:
        return None, str(e)

def estimate_context_from_files():
    """
    从项目文件和对话历史估算上下文使用情况
    """
    import subprocess

    # 获取当前项目目录
    cwd = Path.cwd()

    # 估算基于：
    # 1. 代码库大小（粗略估算会影响上下文）
    # 2. 最近的 git 提交信息
    # 3. 会话历史文件（如果有）

    total_estimate = 0

    # 检查 .claude 目录中的会话文件
    claude_dir = cwd / ".claude"
    if claude_dir.exists():
        # 计算 .claude 目录大小
        try:
            result = subprocess.run(
                ["du", "-sb", str(claude_dir)],
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                size = int(result.stdout.split()[0])
                # 粗略估算：1MB ~ 10% 上下文
                total_estimate = min(int(size / 1024 / 1024 * 10), 100)
        except:
            pass

    # 检查 git 历史（最近提交越多，上下文使用可能越高）
    try:
        result = subprocess.run(
            ["git", "log", "--oneline", "-20"],
            capture_output=True,
            text=True,
            cwd=cwd
        )
        if result.returncode == 0:
            # 每 10 个提交增加 5%
            commit_count = len(result.stdout.strip().split('\n'))
            total_estimate = max(total_estimate, min(commit_count // 2, 50))
    except:
        pass

    return total_estimate if total_estimate > 0 else None

def main():
    """主函数"""
    # 尝试从文件估算
    estimated = estimate_context_from_files()

    if estimated is not None and estimated > 0:
        print(f"{estimated}%")
        return

    # 如果无法估算，尝试 API
    context, error = get_context_from_api()

    if context is not None:
        print(f"{context}%")
    else:
        # 返回默认值
        print("?%")

if __name__ == "__main__":
    main()
