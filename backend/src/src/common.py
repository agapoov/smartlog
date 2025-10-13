from rest_framework import status


class BadRequestException(Exception):
    
    def __init__(self, *args: object, **kwargs)-> (None):
        self.message = None
        self.data = None
        self.response = None
        self.status = status.HTTP_400_BAD_REQUEST
        if args:
            self.message = args[0]
            self.data = args[1] if len(args) > 1 else None
        elif kwargs:
            self.message = kwargs.get("message")
            self.data = kwargs.get("data")
            self.response = kwargs.get("response")
            
        if not self.response:
            self.response = {
                "status": self.status,
                "details": self.message
            }
