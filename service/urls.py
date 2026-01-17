from django.urls import path
from django.urls import re_path

from . import views

urlpatterns = [
    # ex: /service/
    path('', views.index, name='index'),

    # get all services json
    path('ajax/get_all_services/', views.index_ajax),

    # get one service json
    path('ajax/get_one_service/', views.single_service_ajax),

    # for all other backend post request
    path('ajax/interact_backend/', views.interact_with_apache),

    path('private/', views.private_index),
    path('private/ajax/get_all_services/', views.private_index_ajax),
    path('private/ajax/get_one_service/', views.private_single_service_ajax),
    path('private/ajax/interact_backend/', views.private_interact_with_apache),
    re_path(r'private/(?P<service_alt_name>[A-z0-9-\w%]+)$', views.private_single_service),

    path('queen/', views.queen_index),
    path('queen/ajax/get_all_services/', views.queen_index_ajax),
    path('queen/ajax/get_one_service/', views.queen_single_service_ajax),
    path('queen/ajax/interact_backend/', views.queen_interact_with_apache),
    re_path(r'queen/(?P<service_alt_name>[A-z0-9-\w%]+)$', views.queen_single_service),


    # for copo ontology lookup services
    path('api/co_ols', views.crop_ontology_search),

    # for grassroots search services result with payload
    path('payload/<payload>', views.single_service_with_payload),

    # for grassroots search query in url
    # e.g. https://grassroots.tools/service/search/paragon
    path('search/<search_q>', views.single_service_search_q),

    # service name e.g. /service/blast-blastn
    re_path(r'(?P<service_alt_name>[A-z0-9-\w%]+)$', views.single_service),
]