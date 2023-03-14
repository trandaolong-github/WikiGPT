from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def chat_gpt(request):
    if request.method == 'POST':
        message = request.POST.get('message')
        response = "AAAAA" + message  # message[::-1]
        return JsonResponse({'response': response})
    else:
        return JsonResponse({'error': 'Invalid request'})


def home(request):
    return render(request, 'home.html')
