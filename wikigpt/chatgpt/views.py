from django.shortcuts import render
from django.http import JsonResponse
#from django.views.decorators.csrf import csrf_exempt


def chat_gpt(request):
    return render(request, 'chatgpt.html')

def english_teacher(request):
    return render(request, 'english_teacher.html')

def image_generator(request):
    return render(request, 'image_generator.html')

def home(request):
    return render(request, 'home.html')
