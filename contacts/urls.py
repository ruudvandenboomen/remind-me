from django.urls import path

from . import views

app_name = "contacts"

urlpatterns = [
    path("", views.ContactListView.as_view(), name="contact-list"),
    path("contact-create", views.EventCreateView.as_view(), name="contact-create"),
    path(
        "contacts/<int:pk>/delete",
        views.delete_contact,
        name="contact-delete",
    ),
    path(
        "events/<int:pk>/delete",
        views.delete_events,
        name="event-delete",
    ),
    path(
        "contacts/<int:pk>/quickedit",
        views.quick_edit,
        name="quick-edit",
    ),
    path("search/", views.search, name="search"),
    path("upload-vcf/", views.upload_vcf, name="upload"),
]
