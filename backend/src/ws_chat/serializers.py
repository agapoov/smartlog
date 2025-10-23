from rest_framework import serializers
from .models import Chat, ChatParticipant, Message, ChatFile, ChatNotification
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор пользователя"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class ChatFileSerializer(serializers.ModelSerializer):
    """Сериализатор файлов чата"""
    uploaded_by = UserSerializer(read_only=True)
    file_size_mb = serializers.ReadOnlyField()
    
    class Meta:
        model = ChatFile
        fields = ['id', 'file', 'original_name', 'file_size', 'file_size_mb', 
                 'file_type', 'uploaded_by', 'uploaded_at']


class MessageSerializer(serializers.ModelSerializer):
    """Сериализатор сообщений"""
    sender = UserSerializer(read_only=True)
    files = ChatFileSerializer(many=True, read_only=True)
    reply_to = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'content', 'message_type', 'created_at', 'updated_at', 
                 'is_edited', 'sender', 'files', 'reply_to']
        read_only_fields = ['id', 'created_at', 'updated_at', 'sender']
    
    def get_reply_to(self, obj):
        """Получить информацию о сообщении, на которое отвечают"""
        if obj.reply_to:
            return {
                'id': str(obj.reply_to.id),
                'content': obj.reply_to.content[:100] + '...' if len(obj.reply_to.content) > 100 else obj.reply_to.content,
                'sender': obj.reply_to.sender.username,
                'created_at': obj.reply_to.created_at
            }
        return None


class ChatParticipantSerializer(serializers.ModelSerializer):
    """Сериализатор участников чата"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ChatParticipant
        fields = ['user', 'joined_at', 'is_admin', 'is_muted']


class ChatSerializer(serializers.ModelSerializer):
    """Сериализатор чатов"""
    created_by = UserSerializer(read_only=True)
    participants = ChatParticipantSerializer(many=True, read_only=True)
    participants_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Chat
        fields = ['id', 'name', 'description', 'logo', 'created_by', 'created_at', 
                 'updated_at', 'is_active', 'order', 'participants', 'participants_count',
                 'last_message', 'unread_count']
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def get_participants_count(self, obj):
        """Количество участников"""
        return obj.participants.count()
    
    def get_last_message(self, obj):
        """Последнее сообщение"""
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'id': str(last_msg.id),
                'content': last_msg.content[:100] + '...' if len(last_msg.content) > 100 else last_msg.content,
                'sender': last_msg.sender.username,
                'created_at': last_msg.created_at,
                'message_type': last_msg.message_type
            }
        return None
    
    def get_unread_count(self, obj):
        """Количество непрочитанных сообщений"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.notifications.filter(user=request.user, is_read=False).count()
        return 0


class CreateChatSerializer(serializers.ModelSerializer):
    """Сериализатор для создания чата"""
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        help_text="Список ID пользователей для добавления в чат"
    )
    
    class Meta:
        model = Chat
        fields = ['name', 'description', 'logo', 'order', 'participant_ids', 'created_by']
    
    def create(self, validated_data):
        """Создание чата с участниками"""
        participant_ids = validated_data.pop('participant_ids', [])
        chat = Chat.objects.create(**validated_data)
        
        ChatParticipant.objects.create(
            chat=chat,
            user=validated_data['created_by'],
            is_admin=True
        )
        for user_id in participant_ids:
            try:
                user = User.objects.get(id=user_id)
                if user != validated_data['created_by']:
                    ChatParticipant.objects.create(chat=chat, user=user)
            except User.DoesNotExist:
                continue
        
        return chat


class AddParticipantSerializer(serializers.Serializer):
    """Сериализатор для добавления участника"""
    user_id = serializers.IntegerField()
    is_admin = serializers.BooleanField(default=False)
    
    def validate_user_id(self, value):
        """Проверка существования пользователя"""
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Пользователь не найден")
        return value


class ChatNotificationSerializer(serializers.ModelSerializer):
    """Сериализатор уведомлений"""
    chat = ChatSerializer(read_only=True)
    message = MessageSerializer(read_only=True)
    
    class Meta:
        model = ChatNotification
        fields = ['id', 'chat', 'message', 'is_read', 'created_at']


class SendMessageSerializer(serializers.ModelSerializer):
    """Сериализатор для отправки сообщения"""
    files = serializers.ListField(
        child=serializers.FileField(),
        required=False,
        write_only=True,
        help_text="Список файлов для загрузки"
    )
    reply_to_id = serializers.UUIDField(required=False, write_only=True)
    
    class Meta:
        model = Message
        fields = ['content', 'message_type', 'files', 'reply_to_id']
    