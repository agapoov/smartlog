from django.urls import path
from . import views

urlpatterns = [
    path('chats/', views.get_user_chats, name='get_user_chats'),
    path('chats/create/', views.create_chat, name='create_chat'),
    path('chats/<uuid:chat_id>/', views.get_chat_detail, name='get_chat_detail'),
    path('chats/<uuid:chat_id>/update/', views.update_chat, name='update_chat'),
    path('chats/<uuid:chat_id>/delete/', views.delete_chat, name='delete_chat'),
    
    path('chats/<uuid:chat_id>/messages/', views.get_chat_messages, name='get_chat_messages'),
    path('chats/<uuid:chat_id>/send/', views.send_message, name='send_message'),
    
    path('chats/<uuid:chat_id>/add-participant/', views.add_participant, name='add_participant'),
    path('chats/<uuid:chat_id>/remove-participant/<int:user_id>/', views.remove_participant, name='remove_participant'),
    
    path('notifications/', views.get_notifications, name='get_notifications'),
    path('notifications/<int:notification_id>/read/', views.mark_notification_read, name='mark_notification_read'),
    path('notifications/read-all/', views.mark_all_notifications_read, name='mark_all_notifications_read'),
]
