import os
path = r'e:/PROJECTS/sngnews/apps/user-website/src/store/themeStore.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
new_content = content.replace("bg-[#FFE]", "bg-[#FFE]")
with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)
