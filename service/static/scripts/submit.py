# views.py

import json
from pathlib import Path

import requests
from django import forms
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render


BACKEND_URL = "https://grassroots.tools/dev/grassroots/private/backend"
METADATA_FILE = Path(settings.BASE_DIR) / "metadata" / "submit_programme.json"


def read_metadata():
    """
    Reads the pasted JSON metadata from a file.
    Save your JSON as: metadata/submit_programme.json
    """
    with METADATA_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)


def get_service_metadata():
    metadata = read_metadata()
    return metadata["services"][0]


def get_parameters(service_metadata):
    return service_metadata["operation"]["parameter_set"]["parameters"]


def get_groups(service_metadata):
    return service_metadata["operation"]["parameter_set"].get("groups", [])


def field_name(param):
    """
    Converts Grassroots param names into safe Django field names.
    Example: "PR Name" -> "PR_Name"
    """
    return param.replace(" ", "_").replace("-", "_")


def build_field(parameter):
    label = parameter.get("so:name") or parameter["param"]
    description = parameter.get("so:description", "")
    required = parameter.get("required", False)
    readonly = parameter.get("read_only", False)
    grassroots_type = parameter.get("grassroots_type", "xsd:string")
    param_type = parameter.get("type", "string")

    value = parameter.get("current_value")
    if value in (None, "<empty>"):
        value = parameter.get("default_value")
    if value == "<empty>": #may not be neccessary
        value = ""

    attrs = {
        "class": "form-control dynamic-input",
        "title": description,
        "data-param": parameter["param"],
    }

    if parameter.get("refresh"):
        attrs["data-refresh"] = "true"

    if readonly:
        attrs["readonly"] = "readonly"

    enum = parameter.get("enum")

    if enum:
        choices = [
            (item["value"], item.get("so:description") or item["value"])
            for item in enum
        ]

        if param_type == "string_array" or grassroots_type == "params:string_array":
            return forms.MultipleChoiceField(
                label=label,
                choices=choices,
                required=required,
                initial=value or [],
                widget=forms.SelectMultiple(attrs=attrs),
            )

        return forms.ChoiceField(
            label=label,
            choices=choices,
            required=required,
            initial=value,
            widget=forms.Select(attrs=attrs),
        )

    if grassroots_type == "xsd:boolean" or param_type == "boolean":
        return forms.BooleanField(
            label=label,
            required=False,
            initial=bool(value),
            widget=forms.CheckboxInput(attrs={
                "class": "form-check-input dynamic-input",
                "data-param": parameter["param"],
            }),  # why not (attrs=attrs)?
        )

    if param_type == "integer" or grassroots_type in {
        "params:signed_integer",
        "params:unsigned_integer",
        "params:negative_integer",
    }:
        return forms.IntegerField(
            label=label,
            required=required,
            initial=value,
            widget=forms.NumberInput(attrs=attrs),
        )

    if param_type == "number" or grassroots_type in {
        "xsd:double",
        "params:unsigned_number",
    }:
        return forms.FloatField(
            label=label,
            required=required,
            initial=value,
            widget=forms.NumberInput(attrs=attrs),
        )

    if grassroots_type == "xsd:date":
        return forms.DateField(
            label=label,
            required=required,
            initial=value,
            widget=forms.DateInput(attrs={**attrs, "type": "date"}),
        )

    if grassroots_type in {"params:large_string", "params:fasta"}:
        return forms.CharField(
            label=label,
            required=required,
            initial=value or "",
            widget=forms.Textarea(attrs={**attrs, "rows": 5}),
        )

    if grassroots_type in {"params:json", "params:json_array", "params:tabular"}:
        initial = json.dumps(value or {}, indent=2)
        return forms.CharField(
            label=label,
            required=required,
            initial=initial,
            widget=forms.Textarea(attrs={**attrs, "rows": 6}),
        )

    return forms.CharField(
        label=label,
        required=required,
        initial=value or "",
        widget=forms.TextInput(attrs=attrs),
    )


def build_dynamic_form(service_metadata, data=None, initial_values=None):
    fields = {}
    parameters = get_parameters(service_metadata)

    for parameter in parameters:
        name = field_name(parameter["param"])
        field = build_field(parameter)

        if initial_values and parameter["param"] in initial_values:
            field.initial = initial_values[parameter["param"]].   #check what this does

        fields[name] = field

    DynamicProgrammeForm = type(
        "DynamicProgrammeForm",
        (forms.Form,),
        fields,
    )

    return DynamicProgrammeForm(data=data)


Submission function:

def cast_value(value, parameter):
    grassroots_type = parameter.get("grassroots_type", "xsd:string")
    param_type = parameter.get("type", "string")

    if value in ("", None):
        return None

    if param_type == "integer":
        return int(value)

    if param_type == "number":
        return float(value)

    if param_type == "boolean":
        return bool(value)

    if grassroots_type in {"params:json", "params:json_array", "params:tabular"}:
        if isinstance(value, str):
            return json.loads(value)
        return value

    if hasattr(value, "isoformat"):
        return value.isoformat()

    return value


def build_submission_payload(service_metadata, cleaned_data):
    parameters = []

    for parameter in get_parameters(service_metadata):
        param = parameter["param"]
        django_name = field_name(param)

        parameters.append({
            "param": param,
            "current_value": cast_value(
                cleaned_data.get(django_name),
                parameter,
            ),
        })

    return {
        "services": [
            {
                "start_service": True,
                "so:alternateName": service_metadata["so:alternateName"],
                "parameter_set": {
                    "level": "all",
                    "parameters": parameters,
                },
            }
        ]
    }


def submit_to_backend(payload):
    response = requests.post(
        BACKEND_URL,
        data=json.dumps(payload),
        headers={"Content-Type": "application/json"},
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


Main form view:

def programme_form_view(request):
    service_metadata = get_service_metadata()

    if request.method == "POST":
        form = build_dynamic_form(service_metadata, data=request.POST)

        if form.is_valid():
            payload = build_submission_payload(
                service_metadata,
                form.cleaned_data,
            )
            result = submit_to_backend(payload)

            return render(
                request,
                "programme_form.html",
                {
                    "form": form,
                    "service": service_metadata,
                    "payload": json.dumps(payload, indent=2),
                    "result": result,
                },
            )
    else:
        form = build_dynamic_form(service_metadata)

    return render(
        request,
        "programme_form.html",
        {
            "form": form,
            "service": service_metadata,
        },
    )


Autopopulate when Load Programme changes:

def programme_autopopulate_view(request):
    """
    Called when the PR Id / Load Programme field changes.

    It sends a refresh request to the backend and returns the updated
    parameter values so the browser can fill the rest of the form.
    """
    programme_id = request.GET.get("programme_id")

    if not programme_id or programme_id == "<empty>":
        return JsonResponse({"values": {}})

    service_metadata = get_service_metadata()

    refresh_payload = {
        "services": [
            {
                "refresh_service": True,
                "so:alternateName": service_metadata["so:alternateName"],
                "parameter_set": {
                    "level": "all",
                    "parameters": [
                        {
                            "param": "PR Id",
                            "current_value": programme_id,
                        }
                    ],
                },
            }
        ]
    }

    refreshed = submit_to_backend(refresh_payload)

    refreshed_service = refreshed["services"][0]
    refreshed_parameters = refreshed_service["operation"]["parameter_set"]["parameters"]

    values = {}

    for parameter in refreshed_parameters:
        param = parameter["param"]
        value = parameter.get("current_value")

        if value in (None, "<empty>"):
            value = parameter.get("default_value")

        if value != "<empty>":
            values[field_name(param)] = value

    return JsonResponse({"values": values})


urls.py:

from django.urls import path
from . import views

urlpatterns = [
    path("programme/", views.programme_form_view, name="programme_form"),
    path(
        "programme/autopopulate/",
        views.programme_autopopulate_view,
        name="programme_autopopulate",
    ),
]


Template example:

<!-- programme_form.html -->

<h1>{{ service.so:name }}</h1>
<p>{{ service.so:description }}</p>

<form method="post" id="programme-form">
    {% csrf_token %}
    {{ form.as_p }}

    <button type="submit" class="btn btn-primary">
        Submit Programme
    </button>
</form>

{% if payload %}
    <h2>Submitted JSON</h2>
    <pre>{{ payload }}</pre>
{% endif %}

{% if result %}
    <h2>Backend Response</h2>
    <pre>{{ result }}</pre>
{% endif %}

<script>
document.addEventListener("DOMContentLoaded", function () {
    const loadProgramme = document.querySelector('[data-param="PR Id"]');

    if (!loadProgramme) {
        return;
    }

    loadProgramme.addEventListener("change", function () {
        const programmeId = this.value;

        fetch(`/programme/autopopulate/?programme_id=${encodeURIComponent(programmeId)}`)
            .then(response => response.json())
            .then(data => {
                Object.entries(data.values).forEach(([fieldName, value]) => {
                    const field = document.querySelector(`[name="${fieldName}"]`);

                    if (!field) {
                        return;
                    }

                    if (field.tagName === "SELECT" && field.multiple && Array.isArray(value)) {
                        Array.from(field.options).forEach(option => {
                            option.selected = value.includes(option.value);
                        });
                    } else if (field.type === "checkbox") {
                        field.checked = Boolean(value);
                    } else {
                        field.value = value ?? "";
                    }
                });
            });
    });
});
</script>