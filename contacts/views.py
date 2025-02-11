from datetime import date, datetime

import vobject
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.paginator import Paginator
from django.db.models import Q
from django.db.models.functions import ExtractDay, ExtractMonth
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, render
from django.urls import reverse_lazy
from django.views.decorators.http import require_http_methods
from django.views.generic import CreateView, ListView

from .forms import VCFUploadForm
from .models import Contact, Event

""" Method invoked to list contacts """


class ContactListView(LoginRequiredMixin, ListView):
    model = Contact
    template_name = "contacts/contact_list.html"
    context_object_name = "contacts"
    paginate_by = 10

    def get_upcoming_events(self):
        today = date.today()
        current_month = today.month
        current_day = today.day

        # Query for events after today (ignoring the year)
        upcoming_events = (
            Event.objects.annotate(
                event_month=ExtractMonth("date"),
                event_day=ExtractDay("date"),
            )
            .filter(
                Q(
                    event_month=current_month, event_day__gte=current_day
                )  # Later days this month
                | Q(event_month__gt=current_month)  # Future months
            )
            .order_by("event_month", "event_day")
        )  # Sort by month and day

        return upcoming_events

    def get_queryset(self):
        return self.get_upcoming_events()


""" Method invoked to add a contact """


class EventCreateView(LoginRequiredMixin, CreateView):
    model = Event
    template_name = "contacts/contact_create.html"
    fields = ["title", "date", "description", "contact"]

    def form_valid(self, form):
        form.instance.created_by = self.request.user
        return super().form_valid(form)

    def get_success_url(self) -> str:
        return reverse_lazy("contacts:contact-list")


@require_http_methods(["DELETE"])
def delete_contact(request, pk):
    Contact.objects.filter(pk=pk).delete()
    return HttpResponse()


@require_http_methods(["DELETE"])
def delete_events(request, pk):
    Event.objects.filter(pk=pk).delete()
    return HttpResponse()


@require_http_methods(["GET", "POST"])
def quick_edit(request, pk):
    contact = get_object_or_404(Contact, pk=pk)
    if request.method == "POST":
        contact.name = request.POST.get("name", "").strip()
        contact.save()
        return render(request, "contacts/partials/contact.html", {"contact": contact})
    return render(request, "contacts/partials/edit.html", {"contact": contact})


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
            template_name="contacts/partials/search_results.html",
            context={"page": page},
        )
    return render(request, "contacts/search.html")


def upload_vcf(request):
    if request.method == "POST":
        form = VCFUploadForm(request.POST, request.FILES)
        if form.is_valid():
            vcf_file = request.FILES["vcf_file"]
            try:
                # Read and parse the entire VCF file
                vcf_content = vcf_file.read().decode("utf-8")
                vcf_cards = vobject.readComponents(vcf_content)

                contacts_created = 0
                events_created = 0

                for vcf_data in vcf_cards:
                    # Extract contact information
                    name = vcf_data.fn.value
                    phone = getattr(vcf_data, "tel", None)
                    phone_value = phone.value if phone else None

                    # Add events (birthdays, etc.)
                    if hasattr(vcf_data, "bday"):
                        # Create Contact
                        contact, created = Contact.objects.get_or_create(
                            name=name,
                            defaults={
                                "phone_number": phone_value,
                                "created_by": request.user,
                            },
                        )
                        if created:
                            contacts_created += 1

                        bday = datetime.strptime(vcf_data.bday.value, "%Y-%m-%d")
                        omit_year = "X-APPLE-OMIT-YEAR" in vcf_data.bday.params

                        # If omitting the year, replace it with the current year
                        if omit_year:
                            bday = bday.replace(year=datetime.today().year)

                        Event.objects.get_or_create(
                            contact=contact,
                            title="Birthday",
                            date=vcf_data.bday.value,
                            omit_year=omit_year,
                        )
                        events_created += 1

                return JsonResponse(
                    {
                        "contacts_created": contacts_created,
                        "events_created": events_created,
                    }
                )
            except Exception as e:
                return JsonResponse({"error": str(e)}, status=400)
    else:
        form = VCFUploadForm()
    return render(request, "contacts/upload_vcf.html", {"form": form})
