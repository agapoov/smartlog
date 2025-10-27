from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .models import Chat, ChatParticipant, Message, ChatFile, ChatNotification
from .serializers import (
    ChatSerializer, CreateChatSerializer, ChatParticipantSerializer,
    MessageSerializer, SendMessageSerializer, AddParticipantSerializer,
    ChatNotificationSerializer
)
from src.common import BadRequestException, paginate


class ChatPagination(PageNumberPagination):
    """Пагинация для чатов"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_chats(request):
    """Получить все чаты пользователя"""
    try:
        chats = Chat.objects.filter(
            participants__user=request.user,
            is_active=True
        ).select_related('created_by').prefetch_related('participants__user')
        
        search = request.GET.get('search')
        if search:
            chats = chats.filter(name__icontains=search)
        
        order_id = request.GET.get('order_id')
        if order_id:
            chats = chats.filter(order_id=order_id)
        
        paginator = ChatPagination()
        result_page = paginator.paginate_queryset(chats, request)
        
        serializer = ChatSerializer(result_page, many=True, context={'request': request})
        
        return paginator.get_paginated_response(serializer.data)
        
    except Exception as exc:
        raise BadRequestException(f"Ошибка получения чатов: {str(exc)}")


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_chat(request):
    """Создать новый чат"""
    try:
        data = request.data.copy()
        data['created_by'] = request.user.id
        participant_ids = data.pop('participant_ids', [])

        if not request.user.id in participant_ids:
            participant_ids.append(request.user.id)
        
        data['participant_ids'] = participant_ids

        serializer = CreateChatSerializer(data=data)
        if serializer.is_valid():
            chat = serializer.save()
            
            chat_serializer = ChatSerializer(chat, context={'request': request})
            return Response(chat_serializer.data, status=status.HTTP_201_CREATED)
        else:
            raise BadRequestException(f"Ошибка валидации: {serializer.errors}")
            
    except BadRequestException as exc:
        return Response({"details": exc.response}, status=exc.status)
    except Exception as exc:
        raise BadRequestException(f"Ошибка создания чата: {str(exc)}")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_detail(request, chat_id):
    """Получить детали чата"""
    try:
        chat = get_object_or_404(
            Chat.objects.select_related('created_by').prefetch_related('participants__user'),
            id=chat_id,
            participants__user=request.user,
            is_active=True
        )
        
        serializer = ChatSerializer(chat, context={'request': request})
        return Response(serializer.data)
        
    except Exception as exc:
        raise BadRequestException(f"Ошибка получения чата: {str(exc)}")


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_chat(request, chat_id):
    """Обновить чат"""
    try:
        chat = get_object_or_404(
            Chat.objects.filter(participants__user=request.user),
            id=chat_id
        )
        
        participant = ChatParticipant.objects.get(chat=chat, user=request.user)
        if not participant.is_admin and chat.created_by != request.user:
            raise BadRequestException("Недостаточно прав для редактирования чата")
        
        if 'name' in request.data:
            chat.name = request.data['name']
        if 'description' in request.data:
            chat.description = request.data['description']
        if 'logo' in request.data:
            chat.logo = request.data['logo']
        
        chat.save()
        
        serializer = ChatSerializer(chat, context={'request': request})
        return Response(serializer.data)
        
    except BadRequestException as exc:
        return Response({"details": exc.response}, status=exc.status)
    except Exception as exc:
        raise BadRequestException(f"Ошибка обновления чата: {str(exc)}")


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_chat(request, chat_id):
    """Удалить чат"""
    try:
        chat = get_object_or_404(
            Chat.objects.filter(participants__user=request.user),
            id=chat_id
        )
        
        if chat.created_by != request.user:
            raise BadRequestException("Только создатель может удалить чат")
        
        chat.is_active = False
        chat.save()
        
        return Response({"message": "Чат успешно удален"})
        
    except BadRequestException as exc:
        return Response({"details": exc.response}, status=exc.status)
    except Exception as exc:
        raise BadRequestException(f"Ошибка удаления чата: {str(exc)}")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_messages(request, chat_id):
    """Получить сообщения чата"""
    try:
        chat = get_object_or_404(
            Chat.objects.filter(participants__user=request.user),
            id=chat_id
        )
        
        messages = chat.messages.select_related('sender').prefetch_related('files').order_by('created_at')
        
        page = int(request.GET.get('page', 1))
        page_count = int(request.GET.get('page_count', 20))
        
        paginated_messages = paginate(messages, page, page_count)
        
        serializer = MessageSerializer(paginated_messages, many=True)
        
        return Response({
            'data': serializer.data,
            'pagination': {
                'page': page,
                'page_count': page_count,
                'total_count': messages.count(),
                'has_next': page * page_count < messages.count(),
                'has_previous': page > 1
            }
        })
        
    except Exception as exc:
        raise BadRequestException(f"Ошибка получения сообщений: {str(exc)}")


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request, chat_id):
    """Отправить сообщение в чат"""
    try:
        chat = get_object_or_404(
            Chat.objects.filter(participants__user=request.user),
            id=chat_id
        )
        
        participant = ChatParticipant.objects.get(chat=chat, user=request.user)
        if participant.is_muted:
            raise BadRequestException("Вы заглушены в этом чате")
        
        # Получаем данные напрямую из request
        content = request.data.get('content', '')
        message_type = request.data.get('message_type', 'text')
        reply_to_id = request.data.get('reply_to_id')
        files = request.FILES.getlist('files')
        
        if files:
            message_type = 'file'
        
        message = Message.objects.create(
            chat=chat,
            sender=request.user,
            content=content,
            message_type=message_type
        )
        
        if reply_to_id:
            try:
                reply_to = Message.objects.get(id=reply_to_id, chat=chat)
                message.reply_to = reply_to
                message.save()
            except Message.DoesNotExist:
                pass
        
        for file in files:
            ChatFile.objects.create(
                message=message,
                file=file,
                original_name=file.name,
                file_size=file.size,
                file_type=file.content_type,
                uploaded_by=request.user
            )
        
        participants = ChatParticipant.objects.filter(chat=chat).exclude(user=request.user)
        for participant in participants:
            ChatNotification.objects.create(
                user=participant.user,
                chat=chat,
                message=message
            )
        
        response_serializer = MessageSerializer(message)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
    except BadRequestException as exc:
        return Response({"details": exc.response}, status=exc.status)
    except Exception as exc:
        raise BadRequestException(f"Ошибка отправки сообщения: {str(exc)}")


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_participant(request, chat_id):
    """Добавить участника в чат"""
    try:
        chat = get_object_or_404(
            Chat.objects.filter(participants__user=request.user),
            id=chat_id
        )
        
        participant = ChatParticipant.objects.get(chat=chat, user=request.user)
        if not participant.is_admin and chat.created_by != request.user:
            raise BadRequestException("Недостаточно прав для добавления участников")
        
        serializer = AddParticipantSerializer(data=request.data)
        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']
            is_admin = serializer.validated_data['is_admin']
            
            user = User.objects.get(id=user_id)
            
            if ChatParticipant.objects.filter(chat=chat, user=user).exists():
                raise BadRequestException("Пользователь уже является участником чата")
            
            ChatParticipant.objects.create(
                chat=chat,
                user=user,
                is_admin=is_admin
            )
            
            return Response({"message": "Участник успешно добавлен"})
        else:
            raise BadRequestException(f"Ошибка валидации: {serializer.errors}")
            
    except BadRequestException as exc:
        return Response({"details": exc.response}, status=exc.status)
    except Exception as exc:
        raise BadRequestException(f"Ошибка добавления участника: {str(exc)}")


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_participant(request, chat_id, user_id):
    """Удалить участника из чата"""
    try:
        chat = get_object_or_404(
            Chat.objects.filter(participants__user=request.user),
            id=chat_id
        )
        
        participant = ChatParticipant.objects.get(chat=chat, user=request.user)
        if not participant.is_admin and chat.created_by != request.user:
            raise BadRequestException("Недостаточно прав для удаления участников")
        
        if chat.created_by.id == user_id:
            raise BadRequestException("Нельзя удалить создателя чата")
        
        ChatParticipant.objects.filter(chat=chat, user_id=user_id).delete()
        
        return Response({"message": "Участник успешно удален"})
        
    except BadRequestException as exc:
        return Response({"details": exc.response}, status=exc.status)
    except Exception as exc:
        raise BadRequestException(f"Ошибка удаления участника: {str(exc)}")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """Получить уведомления пользователя"""
    try:
        notifications = ChatNotification.objects.filter(
            user=request.user,
            is_read=False
        ).select_related('chat', 'message__sender').order_by('-created_at')
        
        serializer = ChatNotificationSerializer(notifications, many=True)
        return Response(serializer.data)
        
    except Exception as exc:
        raise BadRequestException(f"Ошибка получения уведомлений: {str(exc)}")


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Отметить уведомление как прочитанное"""
    try:
        notification = get_object_or_404(
            ChatNotification.objects.filter(user=request.user),
            id=notification_id
        )
        
        notification.is_read = True
        notification.save()
        
        return Response({"message": "Уведомление отмечено как прочитанное"})
        
    except Exception as exc:
        raise BadRequestException(f"Ошибка обновления уведомления: {str(exc)}")


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """Отметить все уведомления как прочитанные"""
    try:
        ChatNotification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)
        
        return Response({"message": "Все уведомления отмечены как прочитанные"})
        
    except Exception as exc:
        raise BadRequestException(f"Ошибка обновления уведомлений: {str(exc)}")
