#!/usr/bin/env python
"""Backend startup script with proper path configuration."""

import sys
import os

# Add project root to path so backend imports work
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

# Change to backend directory for relative imports to work
os.chdir(os.path.join(project_root, 'backend'))
sys.path.insert(0, os.path.join(project_root, 'backend'))

# Now run the app with uvicorn
if __name__ == "__main__":
    import uvicorn
    # Import from module at this point after path is set
    from app import app

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        reload=False,
        log_level="info"
    )
