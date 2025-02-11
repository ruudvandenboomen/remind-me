from django.contrib.auth.views import LoginView
from django.contrib.messages.views import SuccessMessageMixin
from django.urls import reverse_lazy
from django.views.generic.edit import CreateView

from .forms import CustomLoginForm, CustomUserCreationForm


class SignUpView(SuccessMessageMixin, CreateView):
    template_name = "registration/register.html"
    success_url = reverse_lazy("users:login")
    form_class = CustomUserCreationForm
    success_message = "Your profile was created successfully"


class CustomLoginView(LoginView):
    authentication_form = CustomLoginForm
