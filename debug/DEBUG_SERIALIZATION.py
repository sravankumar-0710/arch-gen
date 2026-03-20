#!/usr/bin/env python3
# Test JSON serialization of layout result

import sys
import os
import json
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
    print("[DEBUG] Generating layouts...")
    result = LayoutService.generate_layouts(land_data, requirements, user_id=1)

    print(f"[DEBUG] Building response_data...")
    response_data = {
        "success": True,
        "data": {
            "layouts": result.get('layouts', []),
            "plotInfo": result.get('plotInfo', {})
        },
        "message": f"Generated {len(result.get('layouts', []))} layout variants"
    }

    print(f"[DEBUG] Serializing to JSON with default=str...")
    json_str = json.dumps(response_data, default=str)
    print(f"[OK] Serialized successfully ({len(json_str)} bytes)")

    print(f"[DEBUG] Parsing back from JSON...")
    parsed = json.loads(json_str)
    print(f"[OK] Parsed successfully")
    print(f"[DEBUG] Number of layouts: {len(parsed['data']['layouts'])}")
    if parsed['data']['layouts']:
        layout = parsed['data']['layouts'][0]
        print(f"[DEBUG] First layout: {json.dumps(layout, indent=2)}")

except Exception as e:
    import traceback
    print(f"[ERROR] {type(e).__name__}: {e}")
    traceback.print_exc()
