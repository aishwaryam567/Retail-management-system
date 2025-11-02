# Create Folder Structure

Run these commands in the Frontend/src directory:

```bash
cd Frontend/src

# Create main folders
mkdir services
mkdir context
mkdir utils
mkdir components
mkdir pages

# Create component subfolders
mkdir components\layout
mkdir components\common

# Create pages subfolders
mkdir pages\auth
```

Or use PowerShell:
```powershell
cd Frontend\src
New-Item -ItemType Directory -Path services, context, utils, components, pages
New-Item -ItemType Directory -Path components\layout, components\common, pages\auth
```

After creating folders, say "folders created" and I'll create all the files!
