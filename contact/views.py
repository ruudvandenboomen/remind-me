from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from django.views.decorators.http import require_http_methods
from django.views.generic import CreateView, ListView
from django.contrib.auth.mixins import LoginRequiredMixin
from .forms import CustomUserCreationForm
from .models import Contact
from django.core.paginator import Paginator

""" Landing page for MyContactShelf """


class HomeView(ListView):
    model = Contact
    template_name = "contact/index.html"


""" Method invoked for Sign up """


def register(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("contact:login")
        else:
            form = CustomUserCreationForm()
    return render(
        request, "registration/register.html", {"form": CustomUserCreationForm}
    )


""" Method invoked to list contacts """


class ContactListView(LoginRequiredMixin, ListView):
    model = Contact
    template_name = "contact/contact-list.html"
    context_object_name = "contacts"
    paginate_by = 10

    def get_queryset(self):
        return Contact.objects.filter(created_by=self.request.user)


""" Method invoked to add a contact """


class ContactCreateView(LoginRequiredMixin, CreateView):
    model = Contact
    template_name = "contact/contact_create.html"
    fields = [
        "name",
    ]

    def form_valid(self, form):
        form.instance.created_by = self.request.user
        return super().form_valid(form)

    def get_success_url(self) -> str:
        return reverse_lazy("contact:contact-list")


@require_http_methods(["DELETE"])
def delete_contact(request, pk):
    Contact.objects.filter(pk=pk).delete()
    # contacts = Contact.objects.filter(created_by=request.user)
    return HttpResponse()


@require_http_methods(["GET", "POST"])
def quick_edit(request, pk):
    contact = get_object_or_404(Contact, pk=pk)
    if request.method == "POST":
        contact.name = request.POST.get("name", "").strip()
        contact.save()
        return render(request, "contact/partials/contact.html", {"contact": contact})
    return render(request, "contact/partials/edit.html", {"contact": contact})


def search(request):
    if request.htmx:
        search = request.GET.get("q")
        page_num = request.GET.get("page", 1)

        if search:
            contacts = Contact.objects.filter(
                name__contains=search, created_by=request.user
            )
        else:
            contacts = Contact.objects.filter(created_by=request.user)

        page = Paginator(object_list=contacts, per_page=5).get_page(page_num)
        return render(
            request=request,
            template_name="contact/partials/search_results.html",
            context={"page": page},
        )
    return render(request, "contact/search.html")
