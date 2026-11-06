from django.urls import path
from django.urls import re_path

from . import views

urlpatterns = [
    # ex: /fieldtrial/ placeholder with html template loading
    path('', views.index_loading, name='index'),

    # display all field trials
    path('all', views.index, name='index_real'),

    # single study/study_id
    path('study/<study_id>', views.single_study),

    # single study's plots plots/study_id
    path('plots/<plot_id>', views.single_plot),

    # all of the images for one plot in a study: plots/study_id/plot_id_or_study_index/images
    path('plots/<study_id>/<plot_ref>/images', views.single_plot_images, name='plot_images'),

    # get one field trial json
    path('ajax/get_fieldtrial/', views.search_fieldtrial),

    # get one field trial page /fieldtrial/fieldtrial_id
    re_path(r'(?P<fieldtrial_id>[A-z0-9-\w%]+)$', views.single_fieldtrial)


]