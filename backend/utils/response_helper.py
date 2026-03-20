# filepath: backend/utils/response_helper.py
# Purpose: Helper functions for consistent API response formatting

from schemas import ApiResponse


def success_response(data=None, message="Success", errors=None):
    """
    Create a success response envelope.

    Args:
        data: Response data payload
        message: Success message
        errors: Optional list of errors/warnings

    Returns:
        ApiResponse object
    """
    return {
        "success": True,
        "data": data,
        "message": message,
        "errors": errors
    }


def error_response(message="Error", errors=None, data=None):
    """
    Create an error response envelope.

    Args:
        message: Error message
        errors: List of error details
        data: Optional data to include

    Returns:
        ApiResponse object
    """
    return {
        "success": False,
        "data": data,
        "message": message,
        "errors": errors or []
    }
