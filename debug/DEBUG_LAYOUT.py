#!/usr/bin/env python3
# Quick debug script to test layout generation locally

import sys
import os
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))

from services.layout_service import LayoutService

# Test data
land_data = {
    "polygonPoints": [
        {"x": 100, "y": 100},
        {"x": 500, "y": 100},
        {"x": 500, "y": 400},
        {"x": 100, "y": 400}
    ],
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
    print("[DEBUG] Calling LayoutService.generate_layouts()")
    result = LayoutService.generate_layouts(land_data, requirements, user_id=1)

    print(f"[DEBUG] Result success: {result['success']}")
    if result['success']:
        print(f"[DEBUG] Generated {len(result['layouts'])} layouts")
        if result['layouts']:
            layout = result['layouts'][0]
            print(f"[DEBUG] First layout keys: {list(layout.keys())}")
            print(f"[DEBUG] First layout: {layout}")
    else:
        print(f"[DEBUG] Error: {result.get('error')}")

except Exception as e:
    import traceback
    print(f"[ERROR] {type(e).__name__}: {e}")
    traceback.print_exc()
