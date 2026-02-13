#!/usr/bin/env python3
import os
import re
import argparse
from pathlib import Path

README_PATH = Path("/root/skills/awesome-openclaw-skills/README.md")

def parse_readme():
    if not README_PATH.exists():
        print(f"Error: {README_PATH} not found.")
        return []

    with open(README_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Split by categories (<details open><summary><h3 ...>Category Name</h3></summary>)
    # The README uses html tags for category headers
    cat_pattern = re.compile(r'<details.*?>\s*<summary>\s*<h3.*?>\s*(.*?)\s*</h3>\s*</summary>', re.DOTALL)
    
    # Split the content by the category pattern
    parts = cat_pattern.split(content)
    
    # parts[0] is everything before first category
    # then parts[1] is name, parts[2] is content, parts[3] name, parts[4] content...
    
    categories = []
    for i in range(1, len(parts), 2):
        category_name = parts[i].strip()
        section_content = parts[i+1]
        
        skills = []
        # Skill pattern: - [Name](URL) - Description
        skill_pattern = re.compile(r'-\s+\[(.*?)\]\((https?://github\.com/.*?)\)(?:\s+-\s+(.*))?')
        
        for line in section_content.strip().split('\n'):
            match = skill_pattern.search(line)
            if match:
                name = match.group(1)
                url = match.group(2)
                desc = match.group(3) or ""
                skills.append({
                    "name": name,
                    "url": url,
                    "description": desc.strip()
                })
        
        if skills:
            categories.append({
                "category": category_name,
                "skills": skills
            })
            
    return categories

def main():
    parser = argparse.ArgumentParser(description="OpenClaw Skill Explorer")
    parser.add_argument("--list", action="store_true", help="List all categories and skills count")
    parser.add_argument("--category", type=str, help="List skills in a specific category")
    parser.add_argument("--search", type=str, help="Search for a skill by name or description")
    args = parser.parse_args()

    categories = parse_readme()

    if args.list:
        print(f"{'Category':<40} | {'Skills':<6}")
        print("-" * 50)
        for cat in categories:
            print(f"{cat['category']:<40} | {len(cat['skills']):<6}")

    elif args.category:
        target = args.category.lower()
        found = False
        for cat in categories:
            if target in cat['category'].lower():
                print(f"\n--- {cat['category']} ---")
                for skill in cat['skills']:
                    print(f"[*] {skill['name']}")
                    if skill['description']:
                        print(f"    {skill['description']}")
                    print(f"    URL: {skill['url']}\n")
                found = True
        if not found:
            print(f"Category '{args.category}' not found.")

    elif args.search:
        query = args.search.lower()
        print(f"Searching for '{args.search}'...\n")
        count = 0
        for cat in categories:
            for skill in cat['skills']:
                if query in skill['name'].lower() or query in skill['description'].lower():
                    print(f"[{cat['category']}] {skill['name']}")
                    if skill['description']:
                        print(f"    {skill['description']}")
                    print(f"    URL: {skill['url']}\n")
                    count += 1
        print(f"Found {count} matches.")

    else:
        parser.print_help()

if __name__ == "__main__":
    main()
