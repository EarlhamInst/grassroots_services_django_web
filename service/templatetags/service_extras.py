from django.template.defaulttags import register

from django import template
from django.conf import settings

register = template.Library()


@register.filter
def get_item(dictionary, key):
    return dictionary.get(key)


@register.filter
def get_logged_in_user_email (dictionary):
    key = None
    name = None

    try:
        key = settings.USER_EMAIL_KEY
    except AttributeError:
        pass

    if (key is not None):
        name = dictionary.get (key)

    return name

@register.filter
def get_logged_in_user_name (dictionary):
    key = None
    name = None

    try:
        key = settings.USER_NAME_KEY
    except AttributeError:
        pass

    if (key is not None):
        name = dictionary.get (key)

    return name




@register.simple_tag
def settings_value(name):
    return getattr (settings, name, None)


