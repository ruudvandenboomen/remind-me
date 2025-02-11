from django import forms


class VCFUploadForm(forms.Form):
    vcf_file = forms.FileField(
        label="Select a VCF file",
        widget=forms.FileInput(
            attrs={"class": "file-input file-input-bordered w-full max-w-xs"}
        ),
    )
