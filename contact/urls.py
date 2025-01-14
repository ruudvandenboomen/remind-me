from django.urls import path

from . import views
from django.contrib.auth import views as auth_views

app_name = "contact"

urlpatterns = [
    path("", views.HomeView.as_view(), name="home"),
    path("login/", auth_views.LoginView.as_view(), name="login"),
    path("logout/", auth_views.LogoutView.as_view(), name="logout"),
    path("register/", views.register, name="register"),
    path("contact-list", views.ContactListView.as_view(), name="contact-list"),
    path("contact-create", views.ContactCreateView.as_view(), name="contact-create"),
    path(
        "contacts/<int:pk>/delete",
        views.delete_contact,
        name="contact-delete",
    ),
    path(
        "contacts/<int:pk>/quickedit",
        views.quick_edit,
        name="quick-edit",
    ),
    path("search/", views.search, name="search"),
]
