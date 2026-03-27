# test_gen.py — run from backend/ directory: python test_gen.py
import sys
import os
sys.path.insert(0, '.')

os.environ.setdefault('DATABASE_URL', 'sqlite:///./archgen.db')
os.environ.setdefault('SECRET_KEY', 'test-secret-key')

from services.layout_service import LayoutService

result = LayoutService.generate_layouts(
    {
        "polygonPoints": [
            {"x": 0,   "y": 0},
            {"x": 100, "y": 0},
            {"x": 100, "y": 100},
            {"x": 0,   "y": 100}
        ],
        "unit": "ft",
        "roadSide": 0,
        "northAngle": 0
    },
    {
        "mode": "basic",
        "bedroomCount": 2,
        "hasKitchen": True,
        "hasLivingRoom": True,
        "hasDiningRoom": False,
        "vastuEnabled": True,
        "floors": 1
    }
)

print("SUCCESS:", result.get("success"))
print("ERROR:", result.get("error"))
print("DETAILS:", result.get("details"))
print("NUM LAYOUTS:", len(result.get("layouts", [])))