#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
静态资源复制和压缩脚本
功能：
1. 复制 CSS、JS、img 等静态文件到 docs 目录
2. 复制其他资源目录
3. 复制 gadgets 目录
4. 复制 src 根目录文件
5. 压缩 CSS 文件（使用 clean-css-cli）
6. 压缩 JavaScript 文件（使用 terser）
"""

import os
import shutil
import subprocess
import sys

# 确保脚本使用 UTF-8 编码
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr.encoding != 'utf-8':
    sys.stderr.reconfigure(encoding='utf-8')

def print_info(message):
    """打印信息"""
    print(f"[INFO] {message}")

def print_error(message):
    """打印错误"""
    print(f"[ERROR] {message}")

def copy_directory(source, destination):
    """复制目录"""
    try:
        if not os.path.exists(destination):
            os.makedirs(destination)
        
        # 复制目录内容
        for item in os.listdir(source):
            s = os.path.join(source, item)
            d = os.path.join(destination, item)
            if os.path.isdir(s):
                copy_directory(s, d)
            else:
                shutil.copy2(s, d)
        print_info(f"Copied directory: {source} -> {destination}")
    except Exception as e:
        print_error(f"Error copying directory {source}: {e}")

def copy_file(source, destination):
    """复制文件"""
    try:
        # 确保目标目录存在
        dest_dir = os.path.dirname(destination)
        if not os.path.exists(dest_dir):
            os.makedirs(dest_dir)
        
        shutil.copy2(source, destination)
        print_info(f"Copied file: {source} -> {destination}")
    except Exception as e:
        print_error(f"Error copying file {source}: {e}")

def compress_css_files(directory):
    """压缩 CSS 文件"""
    try:
        css_files = []
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith('.css') and not file.endswith('.min.css'):
                    css_files.append(os.path.join(root, file))
        
        if css_files:
            print_info(f"Compressing {len(css_files)} CSS files...")
            for css_file in css_files:
                try:
                    # 使用 npx cleancss 压缩 CSS
                    subprocess.run(
                        ['npx', 'cleancss', css_file, '-o', css_file],
                        check=True,
                        shell=True  # 在 Windows 上使用 shell
                    )
                    print_info(f"Compressed CSS: {css_file}")
                except Exception as e:
                    print_error(f"Error compressing CSS {css_file}: {e}")
        else:
            print_info("No CSS files to compress")
    except Exception as e:
        print_error(f"Error during CSS compression: {e}")

def compress_js_files(directory):
    """压缩 JavaScript 文件"""
    try:
        js_files = []
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith('.js') and not file.endswith('.min.js'):
                    js_files.append(os.path.join(root, file))
        
        if js_files:
            print_info(f"Compressing {len(js_files)} JavaScript files...")
            for js_file in js_files:
                try:
                    # 使用 npx terser 压缩 JavaScript
                    subprocess.run(
                        ['npx', 'terser', js_file, '-o', js_file, '--compress', '--mangle'],
                        check=True,
                        shell=True  # 在 Windows 上使用 shell
                    )
                    print_info(f"Compressed JS: {js_file}")
                except Exception as e:
                    print_error(f"Error compressing JS {js_file}: {e}")
        else:
            print_info("No JavaScript files to compress")
    except Exception as e:
        print_error(f"Error during JavaScript compression: {e}")

def main():
    """主函数"""
    print_info("Starting to copy static files...")
    
    # 定义源目录和目标目录
    src_dir = os.path.join(os.getcwd(), 'src')
    docs_dir = os.path.join(os.getcwd(), 'docs')
    
    # 复制 CSS 文件
    css_source = os.path.join(src_dir, 'assets', 'css')
    css_dest = os.path.join(docs_dir, 'assets', 'css')
    if os.path.exists(css_source):
        copy_directory(css_source, css_dest)
    
    # 复制 img 文件
    img_source = os.path.join(src_dir, 'assets', 'img')
    img_dest = os.path.join(docs_dir, 'assets', 'img')
    if os.path.exists(img_source):
        copy_directory(img_source, img_dest)
    
    # 复制 js 文件
    js_source = os.path.join(src_dir, 'assets', 'js')
    js_dest = os.path.join(docs_dir, 'assets', 'js')
    if os.path.exists(js_source):
        copy_directory(js_source, js_dest)
    
    # 复制其他资源目录
    resource_dirs = [
        'dar_svga',
        'mingren_gift_1photo',
        'sth_auto_img',
        'svga',
        'xunzhang'
    ]
    
    for resource_dir in resource_dirs:
        source = os.path.join(src_dir, 'assets', resource_dir)
        dest = os.path.join(docs_dir, 'assets', resource_dir)
        if os.path.exists(source):
            copy_directory(source, dest)
    
    # 复制 gadgets 目录
    gadgets_source = os.path.join(src_dir, 'gadgets')
    gadgets_dest = os.path.join(docs_dir, 'gadgets')
    if os.path.exists(gadgets_source):
        copy_directory(gadgets_source, gadgets_dest)
    
    # 复制 src 根目录文件
    if os.path.exists(src_dir):
        for item in os.listdir(src_dir):
            item_path = os.path.join(src_dir, item)
            if os.path.isfile(item_path):
                dest_path = os.path.join(docs_dir, item)
                copy_file(item_path, dest_path)
    
    # 压缩 CSS 文件
    compress_css_files(os.path.join(docs_dir, 'assets', 'css'))
    
    # 压缩 JavaScript 文件
    compress_js_files(os.path.join(docs_dir, 'assets', 'js'))
    
    print_info("Static files copied and compressed successfully!")

if __name__ == '__main__':
    main()
