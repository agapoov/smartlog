from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction


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

def paginate(snippets, page, page_count):
    """Пагинация snippets"""
    return snippets[(page - 1) * page_count : page * page_count]

    
class Base_APIVIEW(APIView):
    
    model = None
    create_serializer = None
    base_serializer = None
    paginate = False

    def get_queryset(self):
        return self.model.objects.all().order_by('id')
    
    def get_filters(self, request: object):
        filters = {}
        for key, value in request.GET.items():
            if key not in ["page", "page_count"]:
                filters[key] = value[0] if isinstance(value, list) else value
        return filters

    def get(self, request: object, **kwargs) -> (Response):
        id = kwargs.get("id")
        page = int(request.GET.get("page", 1))
        page_count = int(request.GET.get("page_count", 50))

        filters = self.get_filters(request)

        response = {}
        status_code = status.HTTP_200_OK
        snippets = self.get_queryset()
        
        try:
            if id:
                snippets = snippets.get(id=id)
                serializer = self.base_serializer(snippets)
            else:
                if not "Q" in filters:
                    snippets = snippets.filter(**filters)
                else:
                    q_filters = filters.pop("Q")
                    snippets = snippets.filter(**filters)
                    snippets = snippets.filter(q_filters)
                
                total = snippets.count()
                if self.paginate:
                    snippets = paginate(snippets, page, page_count)
                    response["page_count"] = page_count

                serializer = self.base_serializer(snippets, many=True)
                response["total"] = total
            response["data"] = serializer.data
        except self.model.DoesNotExist:
            response["details"] = f"Запись не найдена"
            status_code = status.HTTP_404_NOT_FOUND

        return Response(response, status=status_code)

    def post(self, request: object, **kwargs) -> (Response):
        response = {}
        status_code = status.HTTP_200_OK
        data = request.data.copy()

        try:
            with transaction.atomic():
                serializer = self.create_serializer(data=data, context={'request': request})
                if not serializer.is_valid():
                    raise BadRequestException(serializer.errors)

                serializer.save()
                response["data"] = serializer.data
                
        except BadRequestException as exc:
            response = exc.response
            status_code = exc.status
        

        return Response(response, status=status_code)

    def put(self, request: object, **kwargs) -> (Response):
        id = kwargs.get("id")
        response = {}
        status_code = status.HTTP_200_OK
        data = dict(request.data.copy())
        try:
            if not id:
                raise BadRequestException(f"Запись не найдена")
            with transaction.atomic():
                snippets = self.model.objects.get(id=id)
                serializer = self.create_serializer(instance=snippets, data=data, partial=True, context={'request': request})

                if not serializer.is_valid():
                    raise BadRequestException(serializer.errors)
                
                serializer.save()

                out_serializer = self.base_serializer(snippets)
                response["data"] = out_serializer.data
                
        except BadRequestException as exc:
            response = exc.response
            status_code = exc.status
        except self.model.DoesNotExist:
            response["details"] = f"Запись не найдена"
            status_code = status.HTTP_404_NOT_FOUND
        return Response(response, status=status_code)

    def delete(self, request: object, **kwargs) -> (Response):
        id = kwargs.get("id")
        response = {}
        status_code = status.HTTP_200_OK
        try:
            if not id:
                raise BadRequestException(f"Запись не найдена")
            with transaction.atomic():
                self.model.objects.get(id=id).delete()
                response["message"] = "Успешно удалено"
        except BadRequestException as exc:
            response = exc.response
            status_code = exc.status
        except self.model.DoesNotExist:
            response["details"] = f"Запись не найдена"
            status_code = status.HTTP_404_NOT_FOUND
    
        return Response(response, status=status_code)
