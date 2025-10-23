from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid


class Chat(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, help_text="Название чата")
    description = models.TextField(blank=True, null=True, help_text="Описание чата")
    logo = models.ImageField(upload_to='chat_logos/', blank=True, null=True, help_text="Логотип чата")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_chats')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True, help_text="Активен ли чат")
    
    # мб чат заказа сделать еще
    order = models.ForeignKey('orders.Order', on_delete=models.SET_NULL, null=True, blank=True, 
                             related_name='chats', help_text="Связанный заказ")
    
    class Meta:
        ordering = ['-updated_at']
    


class ChatParticipant(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_participations')
    joined_at = models.DateTimeField(auto_now_add=True)
    is_admin = models.BooleanField(default=False, help_text="Администратор чата")
    is_muted = models.BooleanField(default=False, help_text="Заглушен ли пользователь")
    
    class Meta:
        unique_together = ['chat', 'user']
        ordering = ['joined_at']


class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField(help_text="Текст сообщения")
    message_type = models.CharField(
        max_length=20,
        choices=[
            ('text', 'Текст'),
            ('file', 'Файл'),
            ('image', 'Изображение'),
            ('system', 'Системное'),
        ],
        default='text'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_edited = models.BooleanField(default=False)
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, 
                                related_name='replies', help_text="Ответ на сообщение")
    
    class Meta:
        ordering = ['created_at']


class ChatFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='chat_files/%Y/%m/%d/', help_text="Загруженный файл")
    original_name = models.CharField(max_length=255, help_text="Оригинальное имя файла")
    file_size = models.PositiveIntegerField(help_text="Размер файла в байтах")
    file_type = models.CharField(max_length=255, help_text="Тип файла")
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_chat_files')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    @property
    def file_size_mb(self):
        return round(self.file_size / (1024 * 1024), 2)


class ChatNotification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_notifications')
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='notifications')
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='notifications')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
