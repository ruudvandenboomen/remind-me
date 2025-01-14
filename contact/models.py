from django.db import models
from django.contrib.auth.models import User


class Contact(models.Model):
    name = models.TextField()
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="contacts"
    )
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return self.name
