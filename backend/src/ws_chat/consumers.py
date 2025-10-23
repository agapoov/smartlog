import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Chat, Message, ChatParticipant, ChatNotification
from .serializers import MessageSerializer
import uuid


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer для чата"""
    
    async def connect(self):
        """Подключение к WebSocket"""
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.chat_group_name = f'chat_{self.chat_id}'
        
        # Проверяем аутентификацию
        if not self.scope['user'].is_authenticated:
            print(f"WebSocket: User not authenticated")
            await self.close(code=4001)
            return
        
        # Проверяем участие в чате
        if not await self.is_participant():
            print(f"WebSocket: User {self.scope['user'].username} not participant of chat {self.chat_id}")
            await self.close(code=4003)
            return
        
        print(f"WebSocket: User {self.scope['user'].username} connected to chat {self.chat_id}")
        
        await self.channel_layer.group_add(
            self.chat_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        await self.send_chat_history()
    
    async def disconnect(self, close_code):
        """Отключение от WebSocket"""
        await self.channel_layer.group_discard(
            self.chat_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Получение сообщения от клиента"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if not self.scope['user'].is_authenticated:
                return
            
            if message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'typing':
                await self.handle_typing(data)
            elif message_type == 'read_message':
                await self.handle_read_message(data)
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Неверный формат JSON'
            }))
    
    async def handle_chat_message(self, data):
        """Обработка сообщения чата"""
        content = data.get('content', '').strip()
        reply_to_id = data.get('reply_to_id')
        
        message = await self.create_message(content, reply_to_id)
        
        if message:
            await self.channel_layer.group_send(
                self.chat_group_name,
                {
                    'type': 'chat_message',
                    'message': await self.serialize_message(message)
                }
            )
            
            await self.create_notifications(message)
    
    async def handle_typing(self, data):
        """Обработка индикатора печати"""
        await self.channel_layer.group_send(
            self.chat_group_name,
            {
                'type': 'typing',
                'user': self.scope['user'].username,
                'is_typing': data.get('is_typing', False)
            }
        )
    
    async def handle_read_message(self, data):
        """Обработка отметки о прочтении"""
        message_id = data.get('message_id')
        if message_id:
            await self.mark_message_as_read(message_id)
    
    async def chat_message(self, event):
        """Отправка сообщения клиенту"""
        await self.send(text_data=json.dumps(event['message']))
    
    async def typing(self, event):
        """Отправка индикатора печати"""
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user': event['user'],
            'is_typing': event['is_typing']
        }))
    
    async def user_joined(self, event):
        """Пользователь присоединился к чату"""
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'user': event['user']
        }))
    
    async def user_left(self, event):
        """Пользователь покинул чат"""
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'user': event['user']
        }))
    
    @database_sync_to_async
    def is_participant(self):
        """Проверка, является ли пользователь участником чата"""
        try:
            ChatParticipant.objects.get(
                chat_id=self.chat_id,
                user=self.scope['user']
            )
            return True
        except ChatParticipant.DoesNotExist:
            return False
    
    @database_sync_to_async
    def create_message(self, content, reply_to_id=None):
        """Создание сообщения"""
        try:
            chat = Chat.objects.get(id=self.chat_id)
            reply_to = None
            
            if reply_to_id:
                try:
                    reply_to = Message.objects.get(id=reply_to_id, chat=chat)
                except Message.DoesNotExist:
                    pass
            
            message = Message.objects.create(
                chat=chat,
                sender=self.scope['user'],
                content=content,
                reply_to=reply_to
            )
            
            chat.save()
            
            return message
        except Chat.DoesNotExist:
            return None
    
    @database_sync_to_async
    def serialize_message(self, message):
        """Сериализация сообщения"""
        serializer = MessageSerializer(message)
        return serializer.data
    
    @database_sync_to_async
    def create_notifications(self, message):
        """Создание уведомлений для участников"""
        participants = ChatParticipant.objects.filter(chat=message.chat)
        
        for participant in participants:
            if participant.user != message.sender:
                ChatNotification.objects.create(
                    user=participant.user,
                    chat=message.chat,
                    message=message
                )
    
    @database_sync_to_async
    def mark_message_as_read(self, message_id):
        """Отметка сообщения как прочитанного"""
        try:
            ChatNotification.objects.filter(
                user=self.scope['user'],
                message_id=message_id
            ).update(is_read=True)
        except:
            pass
    
    @database_sync_to_async
    def send_chat_history(self):
        """Отправка истории сообщений"""
        try:
            chat = Chat.objects.get(id=self.chat_id)
            messages = chat.messages.select_related('sender').prefetch_related('files')[:50]
            
            for message in messages:
                serializer = MessageSerializer(message)
                self.send(text_data=json.dumps({
                    'type': 'chat_message',
                    'message': serializer.data
                }))
        except Chat.DoesNotExist:
            pass
