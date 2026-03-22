from django import template
from django.conf import settings

from django.template.defaulttags import register


@register.filter
def get_item(dictionary, key):
    return dictionary.get(key)



register = template.Library()

# settings value
@register.simple_tag
def settings_value(name):
    return getattr(settings, name, "")
