from django.urls import re_path, path
from . import consumers

websocket_urlpatterns = [
    # re_path(r'ws/chat/(?P<chat_id>[0-9a-f-]+)/$', consumers.ChatConsumer.as_asgi()),
    path('ws/chat/<uuid:chat_id>/', consumers.ChatConsumer.as_asgi()),

]
