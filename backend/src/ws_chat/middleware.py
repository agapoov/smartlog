from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model

User = get_user_model()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Middleware для JWT аутентификации в WebSocket
    """
    
    def __init__(self, inner):
        super().__init__(inner)
    
    async def __call__(self, scope, receive, send):
        headers = dict(scope['headers'])
        auth_header = headers.get(b'authorization', b'').decode()
        
        user = AnonymousUser()
        
        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
            try:
                # Валидируем токен
                access_token = AccessToken(token)
                user_id = access_token['user_id']
                user = await self.get_user(user_id)
            except (InvalidToken, TokenError, KeyError):
                print(f"WebSocket: Invalid JWT token")
                pass
        
        scope['user'] = user
        
        return await super().__call__(scope, receive, send)
    
    @database_sync_to_async
    def get_user(self, user_id):
        """Получить пользователя по ID"""
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return AnonymousUser()
