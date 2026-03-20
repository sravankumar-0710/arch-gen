#!/usr/bin/env python3
# Simple test to debug layout generation

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from services.layout_service import LayoutService

land_data = {
    "polygonPoints": [{"x": 100, "y": 100}, {"x": 500, "y": 100}, {"x": 500, "y": 400}, {"x": 100, "y": 400}],
    "unit": "ft",
    "roadSide": 0,
    "northAngle": 45
}

requirements = {
    "mode": "basic",
    "vastuEnabled": True,
    "bedroomCount": 2,
    "hasKitchen": True,
    "hasLivingRoom": True,
    "hasDiningRoom": False
}

try:
    result = LayoutService.generate_layouts(land_data, requirements, user_id=1)
    print("Success!")
    import json
    print(json.dumps(result, indent=2, default=str))
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
